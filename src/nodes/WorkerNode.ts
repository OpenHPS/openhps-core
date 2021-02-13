import { DataFrame, DataSerializer } from '../data';
import { Node, NodeOptions } from '../Node';
import { Thread, Worker, spawn, Pool } from 'threads';
import { Observable } from 'threads/observable';
import { PoolEvent } from 'threads/dist/master/pool';
import { DataService, Service, WorkerServiceCall, WorkerServiceResponse } from '../service';
import { GraphShapeBuilder } from '../graph/builders/GraphBuilder';
import { ModelBuilder } from '../ModelBuilder';
import { PullOptions, PushOptions } from '../graph';

declare const __non_webpack_require__: typeof require;

/**
 * Worker nodes are normal nodes that initialize multiple web workers.
 * Push and pull requests are forwarded to these web workers.
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
 *
 * ### Web Worker
 * ```typescript
 * const workerNode = new WorkerNode((builder) => {
 *      const TimeConsumingNode = require(path.join(__dirname, '../TimeConsumingNode'));
 *      builder.to(new TimeConsumingNode());
 * }, {
 *      worker: 'worker.openhps-core.min.js'    // Worker JS file
 * });
 * ```
 *
 * @category Node
 */
export class WorkerNode<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> {
    protected options: WorkerNodeOptions;

    private _pool: Pool<Thread>;
    private _workerData: any = {};
    private _serviceOutputResponse: Map<number, (response: WorkerServiceResponse) => Promise<void>> = new Map();

    constructor(
        builderCallback: (
            builder: GraphShapeBuilder<ModelBuilder<any, any>>,
            modelBuilder?: ModelBuilder<any, any>,
            args?: any,
        ) => void,
        options?: WorkerNodeOptions,
    );
    constructor(file: string, options?: WorkerNodeOptions);
    constructor(worker: ((...args: any[]) => void) | string, options?: WorkerNodeOptions) {
        super(options);
        this.options.worker = this.options.worker || './_internal/WorkerNodeRunner';
        if (worker instanceof Function) {
            // Code
            this._workerData.builder = worker.toString();
            if (this.options.typescript) {
                // eslint-disable-next-line
                this._workerData.builder = require('typescript').transpile( this._workerData.builder);
            }
        } else {
            this._workerData.shape = worker;
        }

        if (typeof process.env.NODE_ENV === 'undefined') {
            // eslint-disable-next-line
            const NativeWorker = typeof __non_webpack_require__ === "function" ? __non_webpack_require__("worker_threads").Worker : eval("require")("worker_threads").Worker;
            if (NativeWorker) {
                NativeWorker.defaultMaxListeners = 0;
            }
        }

        this.once('build', this._onBuild.bind(this));
        this.once('destroy', this._onDestroy.bind(this));
        this.on('pull', this._onPull.bind(this));
        this.on('push', this._onPush.bind(this));
    }

    private _onPull(options?: PullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.options.optimizedPull) {
                // Do not pass the pull request to the worker
                Promise.all(this.inlets.map((inlet) => inlet.pull(options)))
                    .then(() => {
                        resolve();
                    })
                    .catch(reject);
            } else {
                // Pass the pull request to the worker
                this._pool
                    .queue((worker: any) => {
                        const pullFn: (options?: PullOptions) => Promise<void> = worker.pull;
                        return pullFn(options);
                    })
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    private _onPush(frame: In | In[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._pool
                .queue((worker: any) => {
                    const pushFn: (frame: any, options?: PushOptions) => Promise<void> = worker.push;
                    return pushFn(DataSerializer.serialize(frame), options);
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    private _onDestroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._pool === undefined) {
                return resolve();
            }
            const timeout = setTimeout(() => {
                this._pool.terminate(true);
            }, 2500);
            this._pool
                .terminate()
                .then(() => {
                    clearTimeout(timeout);
                    resolve();
                })
                .catch((ex) => {
                    clearTimeout(timeout);
                    reject(ex);
                });
        });
    }

    /**
     * Spawn a single worker
     *  This method can be called multiple times in a pool
     *
     * @returns {Promise<Thread>} Thread spawn promise
     */
    private _spawnWorker(): Promise<Thread> {
        return new Promise((resolve, reject) => {
            // NOTE: We can not use a conditional expression as this breaks the webpack threads plugin
            const worker = new Worker(this.options.worker);

            spawn(worker).then((thread: Thread) => {
                const init: (workerData: any) => Promise<void> = (thread as any).init;
                const pushOutput: () => Observable<any> = (thread as any).pushOutput;
                const pullOutput: () => Observable<void> = (thread as any).pullOutput;
                const serviceOutputCall: () => Observable<WorkerServiceCall> = (thread as any).serviceOutputCall;
                const eventOutput: () => Observable<any> = (thread as any).eventOutput;

                const threadId = (worker as any).threadId;
                this._serviceOutputResponse.set(threadId, (thread as any).serviceOutputResponse);

                this.logger('debug', { message: 'Worker thread spawned!' });

                // Subscribe to the workers pull, push and service functions
                pullOutput().subscribe(this._onWorkerPull.bind(this));
                pushOutput().subscribe(this._onWorkerPush.bind(this));
                serviceOutputCall().subscribe(this._onWorkerService.bind(this, threadId));
                eventOutput().subscribe(this._onWorkerEvent.bind(this));

                // Serialize this model services to the worker
                const services: Service[] = this.options.services || this.model.findAllServices();
                const servicesArray: any[] = services.map((service) => {
                    // Services are wrapped in a proxy. Get prototype
                    const serviceBase = Object.getPrototypeOf(service);
                    return {
                        name: service.name,
                        type: serviceBase.constructor.name,
                        dataType: service instanceof DataService ? (service as any).driver.dataType.name : undefined,
                    };
                });

                // Initialize the worker
                init({
                    dirname: this.options.directory || __dirname,
                    services: servicesArray,
                    imports: this.options.imports || [],
                    args: this.options.args || {},
                    ...this._workerData,
                })
                    .then(() => {
                        resolve(thread);
                    })
                    .catch(reject);
            });
        });
    }

    private _onWorkerService(threadId: number, value: WorkerServiceCall): void {
        const service: Service =
            this.model.findDataService(value.serviceName) || this.model.findService(value.serviceName);
        if ((service as any)[value.method]) {
            const serializedParams = value.parameters;
            const params: any[] = [];
            serializedParams.forEach((param: any) => {
                if (param['__type']) {
                    params.push(DataSerializer.deserialize(param));
                } else {
                    params.push(param);
                }
            });
            const promise = (service as any)[value.method](...params) as Promise<any>;
            Promise.resolve(promise)
                .then((_) => {
                    if (Array.isArray(_)) {
                        const result: any[] = [];
                        _.forEach((r) => {
                            result.push(DataSerializer.serialize(r));
                        });
                        this._serviceOutputResponse.get(threadId)({ id: value.id, success: true, result });
                    } else {
                        const result = DataSerializer.serialize(_);
                        this._serviceOutputResponse.get(threadId)({ id: value.id, success: true, result });
                    }
                })
                .catch((ex) => {
                    this._serviceOutputResponse.get(threadId)({ id: value.id, success: false, result: ex });
                });
        }
    }

    private _onWorkerEvent(value: { name: string; event: any }): void {
        this.inlets.map((inlet) => inlet.emit(value.name as any, value.event));
    }

    /**
     * Triggered for each worker that requests a pull
     *
     * @param {PullOptions} options Pull options
     */
    private _onWorkerPull(options?: PullOptions): void {
        this.inlets.forEach((inlet) => inlet.pull(options));
    }

    /**
     * Triggered for each worker that pushes data
     *
     * @param {any} value Serialized data
     * @param {PushOptions} options Push options
     */
    private _onWorkerPush(value: any, options?: PushOptions): void {
        const deserializedFrame: DataFrame = DataSerializer.deserialize(value);
        this.outlets.forEach((outlet) => outlet.push(deserializedFrame as any, options));
    }

    private _onBuild(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.logger('debug', {
                message: 'Spawning new worker thread ...',
            });
            this._pool = Pool(() => this._spawnWorker(), {
                size: this.options.poolSize || 4,
                concurrency: this.options.poolConcurrency || 2,
            });
            this._pool.events().subscribe((value: PoolEvent<Thread>) => {
                if (value.type === 'initialized') {
                    resolve();
                }
            });
        });
    }
}

export interface WorkerNodeOptions extends NodeOptions {
    directory?: string;
    /**
     * Pool size, defaults to 4 but should equal the amount of available cores - 1
     */
    poolSize?: number;
    /**
     * Concurrent tasks send to the same worker in the pool
     */
    poolConcurrency?: number;
    /**
     * Pull requests skip the worker
     */
    optimizedPull?: boolean;
    /**
     * Worker runner file. When running in the browser, this is the js file named
     * ```worker.openhps-core.min.js```
     */
    worker?: string;
    /**
     * Worker external imports
     */
    imports?: string[];
    /**
     * Services to clone from main thread. When not specified it will clone all services
     */
    services?: Service[];
    /**
     * Specify if the worker is written in TypeScript
     */
    typescript?: boolean;
    args?: any;
}
