import { DataFrame, DataSerializer } from "../data";
import { GraphPushOptions, GraphPullOptions } from "../graph";
import { Node } from "../Node";
import { Thread, Worker, spawn, Pool } from "threads";
import { Observable, Subject } from "threads/observable";
import { PoolEvent } from "threads/dist/master/pool";
import { Model } from "../Model";
import { isArray } from "util";
import { ModelShapeBuilder } from "../ModelBuilder";

/**
 * 
 * ## Usage
 * 
 * ### Absolute Imports
 * ```typescript
 * const workerNode = new WorkerNode((builder) => {
 *      const TimeConsumingNode = require('@openhps/abc');
 *      builder.to(new TimeConsumingNode());
 * });
 * ```
 * 
 * ### Relative Imports
 * ```typescript
 * const workerNode = new WorkerNode((builder) => {
 *      const TimeConsumingNode = require(path.join(__dirname, '../TimeConsumingNode'));
 *      builder.to(new TimeConsumingNode());
 * }, { directory: __dirname });
 * ```
 */
export class WorkerNode<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> {
    private _worker: Worker;
    private _pool: Pool<Thread>;
    private _builderCallback: (builder: ModelShapeBuilder) => void;
    private _options: WorkerNodeOptions;
    private _serviceOutputFn: (id: string, success: boolean, result?: any) => Promise<void>;

    constructor(builderCallback: (builder: ModelShapeBuilder) => void, options: WorkerNodeOptions = new WorkerNodeOptions()) {
        super();
        this._builderCallback = builderCallback;
        this._options = options;

        this._worker = new Worker('_internal/WorkerNodeRunner');

        this.once('build', this._onBuild.bind(this));
        this.once('destroy', this._onDestroy.bind(this));
        this.on('pull', this._onPull.bind(this));
        this.on('push', this._onPush.bind(this));
    }

    private _onPull(options?: GraphPullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._options.optimizedPull) {
                // Do not pass the pull request to the worker
                const pullPromises = new Array();
                this.inputNodes.forEach(node => {
                    pullPromises.push(node.pull(options));
                });

                Promise.all(pullPromises).then(_ => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                // Pass the pull request to the worker
                this._pool.queue((worker: any) => {
                    const pullFn: (options?: GraphPullOptions) => Promise<Promise<void>> = worker.pull;
                    return Promise.resolve(pullFn(DataSerializer.serialize(options)));
                }).then(promise => {
                    return promise;
                }).then(() => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            }
        });
    }

    private _onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._pool.queue((worker: any) => {
                const pushFn: (data: In, options?: GraphPushOptions) => Promise<Promise<void>> = worker.push;
                return pushFn(DataSerializer.serialize(data), DataSerializer.serialize(options));
            }).then(promise => {
                return promise;
            }).then(() => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _onDestroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._pool === undefined) {
                return resolve();
            }
            this._pool.terminate().then((_: any) => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _spawnWorker(): Promise<Thread> {
        return new Promise((resolve, reject) => {
            spawn(this._worker).then((thread: Thread) => {
                const initFn: (workerData: any) => Promise<void> = (thread as any).init;
                const outputFn: () => Observable<{ data: any, options?: GraphPushOptions }> = (thread as any).output;
                const inputFn: () => Observable<{ options?: GraphPullOptions }> = (thread as any).input;
                const serviceInput: () => Observable<{ id: string, serviceName: string, method: string, parameters: any }> = (thread as any).serviceInput;
                this._serviceOutputFn = (thread as any).serviceOutput;

                this.logger('debug', {
                    message: "Worker thread spawned!",
                });

                inputFn().subscribe(this._onWorkerPull.bind(this));
                outputFn().subscribe(this._onWorkerPush.bind(this));
                serviceInput().subscribe(this._onWorkerService.bind(this));

                initFn({
                    dirname: this._options.directory,
                    builderCallback: this._builderCallback.toString()
                }).then(_ => {
                    resolve(thread);
                }).catch(ex => {
                    reject(ex);
                });
            });
        });
    }

    private _onWorkerService(value: { id: string, serviceName: string, method: string, parameters: any }): void {
        const model = (this.graph as Model<any, any>);
        const service = model.findDataServiceByName(value.serviceName);
        if ((service as any)[value.method]) {
            const serializedParams = value.parameters;
            const params = new Array();
            serializedParams.forEach((param: any) => {
                if (param["__type"]) {
                    params.push(DataSerializer.deserialize(param));
                } else {
                    params.push(param);
                }
            });
            const promise = (service as any)[value.method](...params) as Promise<any>;
            promise.then(_ => {
                if (isArray(_)) {
                    const result = new Array();
                    _.forEach(r => {
                        result.push(DataSerializer.serialize(r));
                    });
                    Promise.resolve(this._serviceOutputFn(value.id, true, result));
                } else {
                    const result = DataSerializer.serialize(_);
                    Promise.resolve(this._serviceOutputFn(value.id, true, result));
                }
            }).catch(ex => {
                Promise.resolve(this._serviceOutputFn(value.id, false, ex));
            });
        }
    }

    private _onWorkerPull(value: { options?: GraphPullOptions }): void {
        const deserializedOptions = DataSerializer.deserialize(value.options) as GraphPullOptions;

        const pullPromises = new Array();
        this.inputNodes.forEach(node => {
            pullPromises.push(node.pull(deserializedOptions));
        });

        Promise.all(pullPromises);
    }

    private _onWorkerPush(value: { data: any, options?: GraphPushOptions }): void {
        const deserializedData = DataSerializer.deserialize(value.data);
        const deserializedOptions = DataSerializer.deserialize(value.options);

        const pushPromises = new Array();
        this.outputNodes.forEach(node => {
            pushPromises.push(node.push(deserializedData, deserializedOptions));
        });

        Promise.all(pushPromises);
    }

    private _onBuild(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.logger('debug', {
                message: "Spawning new worker thread ..."
            });
            this._pool = Pool(() => this._spawnWorker(), this._options.poolSize);
            this._pool.events().subscribe((value: PoolEvent<Thread>) => {
                if (value.type === 'initialized') {
                    resolve();
                }
            });
            this.emit('ready');
        });
    }
}
export class WorkerNodeOptions {
    directory?: string = __dirname;
    poolSize?: number = 4;
    optimizedPull?: boolean = false;
}
