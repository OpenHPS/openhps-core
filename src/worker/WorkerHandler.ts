import { Pool, spawn, Thread, Worker } from 'threads';
import { PoolEvent } from 'threads/dist/master/pool';
import { Observable } from 'threads/observable';
import { DataFrame } from '../data/DataFrame';
import { DataSerializer } from '../data/DataSerializer';
import { PullOptions, PushOptions } from '../graph/options';
import { DataService } from '../service/DataService';
import { Service } from '../service/Service';
import { WorkerServiceCall, WorkerServiceProxy, WorkerServiceResponse } from '../service/WorkerServiceProxy';
import { WorkerData } from './WorkerData';
import { AsyncEventEmitter } from '../_internal/AsyncEventEmitter';
import { DummyDataService } from '../service/DummyDataService';
import { DummyService } from '../service/DummyService';
import { ModelGraph } from '../graph/_internal/implementations/ModelGraph';
import { WorkerOptions } from './WorkerOptions';
import { Model } from '../Model';

declare const __non_webpack_require__: typeof require;

export class WorkerHandler extends AsyncEventEmitter {
    private _pool: Pool<Thread>;
    public config: WorkerData;
    public options: WorkerOptions;
    private _serviceOutputResponse: Map<number, (response: WorkerServiceResponse) => Promise<void>> = new Map();
    protected model: Model;

    constructor(model: Model, options: WorkerOptions, config: WorkerData) {
        super();
        this.model = model;
        this.config = config;
        this.options = options;
        this.options.timeout = this.options.timeout ?? 10000;
    }

    build(): Promise<void> {
        return new Promise<void>((resolve) => {
            if (typeof process.env.NODE_ENV === 'undefined') {
                // eslint-disable-next-line
                const NativeWorker = typeof __non_webpack_require__ === "function" ? __non_webpack_require__("worker_threads").Worker : eval("require")("worker_threads").Worker;
                if (NativeWorker) {
                    NativeWorker.defaultMaxListeners = 0;
                }
            }

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

    destroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._pool === undefined) {
                return resolve();
            }
            const timeout = setTimeout(() => {
                this._pool
                    .terminate(true)
                    .then(() => {
                        resolve();
                    })
                    .catch((ex) => {
                        reject(ex);
                    });
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

    pull(options?: PullOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            // Pass the pull request to the worker
            this._pool
                .queue((worker: any) => {
                    const pullFn: (options?: PullOptions) => Promise<void> = worker.pull;
                    return pullFn(options);
                })
                .then(resolve)
                .catch(reject);
        });
    }

    push(frame: DataFrame | DataFrame[], options?: PushOptions): Promise<void> {
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
            spawn(worker, {
                timeout: this.options.timeout,
            })
                .then((thread: Thread) => {
                    const init: (workerData: WorkerData) => Promise<void> = (thread as any).init;
                    const pushOutput: () => Observable<any> = (thread as any).pushOutput;
                    const pullOutput: () => Observable<void> = (thread as any).pullOutput;
                    const serviceOutputCall: () => Observable<WorkerServiceCall> = (thread as any).serviceOutputCall;
                    const serviceInputCall: (call: WorkerServiceCall) => Promise<WorkerServiceResponse> = (
                        thread as any
                    ).serviceInputCall;
                    const eventOutput: () => Observable<any> = (thread as any).eventOutput;
                    const findAllServices: () => Promise<any[]> = (thread as any).findAllServices;

                    const threadId = (worker as any).threadId;
                    this._serviceOutputResponse.set(threadId, (thread as any).serviceOutputResponse);

                    // Subscribe to the workers pull, push and service functions
                    pullOutput().subscribe(this._onWorkerPull.bind(this));
                    pushOutput().subscribe(this._onWorkerPush.bind(this));
                    serviceOutputCall().subscribe(this._onWorkerService.bind(this, threadId));
                    eventOutput().subscribe(this._onWorkerEvent.bind(this));

                    // Initialize the worker
                    init({
                        directory: this.options.directory || __dirname,
                        services: this._getServices(),
                        imports: this.options.imports || [],
                        args: this.options.args || {},
                        ...this.config,
                    })
                        .then(() => {
                            return findAllServices();
                        })
                        .then((services: any[]) => {
                            this._addServices(services, serviceInputCall);
                            resolve(thread);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    /**
     * Serialize the services of this model
     *
     * @returns {any[]} Services array
     */
    private _getServices(): any[] {
        // Serialize this model services to the worker
        const services: Service[] = this.options.services || this.model.findAllServices();
        const servicesArray: any[] = services.map((service) => {
            // Services are wrapped in a proxy. Get prototype
            const serviceBase = Object.getPrototypeOf(service);
            return {
                uid: service.uid,
                type: serviceBase.constructor.name,
                dataType:
                    service instanceof DataService ? (service.dataType ? service.dataType.name : undefined) : undefined,
            };
        });
        return servicesArray;
    }

    private _addServices(services: any[], call: (call: WorkerServiceCall) => Promise<WorkerServiceResponse>): void {
        const model = this.model as ModelGraph<any, any>;
        services
            .filter((service) => {
                const internalService =
                    this.model.findService(service.name) || this.model.findDataService(service.name);
                return internalService === undefined;
            })
            .forEach((service) => {
                if (service.dataType) {
                    const DataType = DataSerializer.findTypeByName(service.dataType);
                    model.addService(
                        new DummyDataService(service.uid, DataType),
                        new WorkerServiceProxy({
                            uid: service.uid,
                            callFunction: call,
                        }),
                    );
                } else {
                    model.addService(
                        new DummyService(service.uid),
                        new WorkerServiceProxy({
                            uid: service.uid,
                            callFunction: call,
                        }),
                    );
                }
            });
    }

    private _onWorkerService(threadId: number, value: WorkerServiceCall): void {
        const service: Service =
            this.model.findDataService(value.serviceUID) || this.model.findService(value.serviceUID);
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
        this.emit('event', value);
    }

    /**
     * Triggered for each worker that requests a pull
     *
     * @param {PullOptions} options Pull options
     */
    private _onWorkerPull(options?: PullOptions): void {
        this.emit('pull', options);
    }

    /**
     * Triggered for each worker that pushes data
     *
     * @param {any} value Serialized data
     * @param {PushOptions} options Push options
     */
    private _onWorkerPush(value: any, options?: PushOptions): void {
        const deserializedFrame: DataFrame = DataSerializer.deserialize(value);
        this.emit('push', deserializedFrame, options);
    }
}
