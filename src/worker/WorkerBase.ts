import 'reflect-metadata';
import { Subject } from 'threads/observable';
import {
    DataFrame,
    DataSerializer,
    PullOptions,
    PushOptions,
    Model,
    ModelBuilder,
    WorkerServiceProxy,
    WorkerServiceCall,
    WorkerServiceResponse,
    CallbackSourceNode,
    CallbackSinkNode,
    Service,
    DataService,
    DummyDataService,
    DummyService,
    Node,
    ModelSerializer,
    GraphBuilder,
} from '..'; // external @openhps/core
import { WorkerData } from './WorkerData';

export class WorkerBase {
    shape: GraphBuilder<any, any>;
    model: Model<any, any>;
    pullOutput: Subject<any> = new Subject();
    pushOutput: Subject<any> = new Subject();
    serviceOutputCall: Subject<WorkerServiceCall> = new Subject();
    serviceOutputResponse: Subject<WorkerServiceResponse> = new Subject();
    eventOutput: Subject<{
        name: string;
        event: any;
    }> = new Subject();
    protected config: WorkerData;

    setShape(shape: GraphBuilder<any, any>): void {
        this.shape = shape;
    }

    init(config: WorkerData): Promise<void> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            this.config = config;
            const importFn: (file: string) => Promise<any> =
                typeof process !== 'object'
                    ? config.type === 'module'
                        ? (file: string) => import(/* webpackIgnore: true */ file) // ES6
                        : (file: string) => Promise.resolve(importScripts(/* webpackIgnore: true */ file)) // CJS
                    : // eslint-disable-next-line @typescript-eslint/no-var-requires
                      (file: string) => Promise.resolve(require(/* webpackIgnore: true */ file)); // NodeJS

            // Set global dir name
            // eslint-disable-next-line no-global-assign
            __dirname = config.directory;
            // Load external scripts
            if (config.imports && config.imports.length > 0) {
                config.imports.forEach((importFile) => {
                    importFn(importFile);
                });
            }

            // Create model
            const modelBuilder = ModelBuilder.create();
            // Add remote worker services if not already added
            this.config.services.forEach((service) => {
                if (service.dataType) {
                    const DataType = DataSerializer.findTypeByName(service.dataType);
                    modelBuilder.addService(
                        new DummyDataService(service.uid, DataType),
                        new WorkerServiceProxy({
                            uid: service.uid,
                            callObservable: this.serviceOutputCall,
                            responseObservable: this.serviceOutputResponse,
                        }),
                    );
                } else {
                    modelBuilder.addService(
                        new DummyService(service.uid),
                        new WorkerServiceProxy({
                            uid: service.uid,
                            callObservable: this.serviceOutputCall,
                            responseObservable: this.serviceOutputResponse,
                        }),
                    );
                }
            });

            this._initModel(modelBuilder);

            // eslint-disable-next-line
            const path = this.config.imports.length > 0 ? undefined : (typeof process !== 'object' ? undefined : require('path'));

            if (this.config.serialized) {
                try {
                    const traversalBuilder = modelBuilder.from();
                    const modelOrNode = ModelSerializer.deserializeNode(this.config.serialized);
                    traversalBuilder.via(modelOrNode as Node<any, any>);
                    traversalBuilder.to();
                } catch (ex) {
                    // Error deserializing, did you import the nodes?
                    reject(ex);
                }
            } else if (this.config.builder) {
                const traversalBuilder = modelBuilder.from();
                // eslint-disable-next-line
                const builderCallback = eval(this.config.builder);
                builderCallback(traversalBuilder, modelBuilder, this.config.args);
                traversalBuilder.to();
            } else if (this.config.shape) {
                // eslint-disable-next-line
                const graph = await importFn(path ? path.join(__dirname, this.config.shape) : this.config.shape);
                if (graph) {
                    modelBuilder.addShape(graph.default);
                }
            } else if (this.shape) {
                modelBuilder.addShape(this.shape);
            }

            modelBuilder
                .build()
                .then((m) => {
                    this.model = m;
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Pull from this work
     *
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    pull(options?: PullOptions): Promise<void> {
        return this.model.pull(options);
    }

    /**
     * Push to this worker
     *
     * @param {DataFrame} frame Data frame
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    push(frame: DataFrame, options?: PushOptions): Promise<void> {
        return this.model.push(DataSerializer.deserialize(frame), options);
    }

    /**
     * Init the model internal input and internal output
     *
     * @param {ModelBuilder} modelBuilder Model builder
     */
    private _initModel(modelBuilder: ModelBuilder<any, any>): void {
        const internalSource = new CallbackSourceNode((options?: PullOptions) => {
            // Send a pull request to the main thread
            this.pullOutput.next(options);
            return undefined;
        });
        const internalSink = new CallbackSinkNode((frame: DataFrame) => {
            // Serialize the frame and transmit it to the main thread
            this.pushOutput.next(DataSerializer.serialize(frame));
        });

        modelBuilder.graph.deleteNode(modelBuilder.graph.internalSource);
        modelBuilder.graph.internalSource = internalSource;
        internalSource.on('error', (event: any) => {
            this.eventOutput.next({
                name: 'error',
                event,
            });
        });
        internalSource.on('completed', (event: any) => {
            this.eventOutput.next({
                name: 'completed',
                event,
            });
        });
        modelBuilder.graph.addNode(modelBuilder.graph.internalSource);
        modelBuilder.graph.deleteNode(modelBuilder.graph.internalSink);
        modelBuilder.graph.internalSink = internalSink;
        modelBuilder.graph.addNode(modelBuilder.graph.internalSink);
    }

    findAllServices(): Promise<any[]> {
        return new Promise((resolve) => {
            const services: Service[] = this.model.findAllServices();
            const servicesArray: any[] = services
                .filter((service) => !(service instanceof DummyDataService || service instanceof DummyService))
                .map((service) => {
                    // Services are wrapped in a proxy. Get prototype
                    const serviceBase = Object.getPrototypeOf(service);
                    return {
                        uid: service.uid,
                        type: serviceBase.constructor.name,
                        dataType: service instanceof DataService ? (service as any).driver.dataType.name : undefined,
                    };
                });
            resolve(servicesArray);
        });
    }

    callService(call: WorkerServiceCall): Promise<WorkerServiceResponse> {
        return new Promise((resolve, reject) => {
            const service: Service =
                this.model.findDataService(call.serviceUID) || this.model.findService(call.serviceUID);
            if ((service as any)[call.method]) {
                const serializedParams = call.parameters;
                const params: any[] = [];
                serializedParams.forEach((param: any) => {
                    if (param['__type']) {
                        params.push(DataSerializer.deserialize(param));
                    } else {
                        params.push(param);
                    }
                });
                const promise = (service as any)[call.method](...params) as Promise<any>;
                Promise.resolve(promise)
                    .then((_) => {
                        if (Array.isArray(_)) {
                            const result: any[] = [];
                            _.forEach((r) => {
                                result.push(DataSerializer.serialize(r));
                            });
                            resolve({ id: call.id, success: true, result });
                        } else {
                            const result = DataSerializer.serialize(_);
                            resolve({ id: call.id, success: true, result });
                        }
                    })
                    .catch((ex) => {
                        reject({ id: call.id, success: false, result: ex });
                    });
            }
        });
    }
}
