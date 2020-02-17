import { DataFrame, DataSerializer } from "../data";
import { GraphPushOptions, GraphPullOptions } from "../graph";
import { Node } from "../Node";
import * as fs from 'fs';
import { Thread, Worker, spawn, Pool } from "threads";
import { Observable } from "threads/observable";
import { GraphShapeBuilder } from "../graph/builders";
import * as os from 'os';
import { PoolEvent } from "threads/dist/master/pool";

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
    private _builderCallback: (builder: GraphShapeBuilder<any>) => void;
    private _options: WorkerNodeOptions;

    constructor(builderCallback: (builder: GraphShapeBuilder<any>) => void, options: WorkerNodeOptions = new WorkerNodeOptions()) {
        super();
        this._builderCallback = builderCallback;
        this._options = options;

        const workerJS = '_internal/WorkerNodeRunner.js';
        const workerTS = '_internal/WorkerNodeRunner.ts';
        this._worker = new Worker(fs.existsSync(workerJS) ? workerJS : workerTS);
        
        this.on('build', this._onBuild.bind(this));
        this.on('destroy', this._onDestroy.bind(this));
        this.on('pull', this._onPull.bind(this));
        this.on('push', this._onPush.bind(this));
    }

    private _onPull(options?: GraphPullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._pool.queue((worker: any) => {
                const pullFn: (options?: GraphPullOptions) => Promise<void> = worker.pull;
                return pullFn(DataSerializer.serialize(options));
            }).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _onPush(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._pool.queue((worker: any) => {
                const pushFn: (data: In, options?: GraphPushOptions) => Promise<void> = worker.push;
                return pushFn(DataSerializer.serialize(data), DataSerializer.serialize(options));
            }).then(_ => {
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

                this.logger('debug', {
                    message: "Worker thread spawned!",
                });

                inputFn().subscribe((value: any) => {
                    const deserializedOptions = DataSerializer.deserialize(value.options) as GraphPullOptions;

                    const pullPromises = new Array();
                    this.inputNodes.forEach(node => {
                        pullPromises.push(node.pull(deserializedOptions));
                    });
    
                    Promise.all(pullPromises);
                });
                outputFn().subscribe((value: any) => {
                    const deserializedData = DataSerializer.deserialize(value.data);
                    const deserializedOptions = DataSerializer.deserialize(value.options);

                    const pushPromises = new Array();
                    this.outputNodes.forEach(node => {
                        pushPromises.push(node.push(deserializedData, deserializedOptions));
                    });
    
                    Promise.all(pushPromises);
                });

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
        });
    }
}
export class WorkerNodeOptions {
    directory?: string = __dirname;
    poolSize?: number = os.cpus().length;
}
