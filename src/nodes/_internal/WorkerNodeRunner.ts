import 'reflect-metadata';
import {
    DataSerializer,
    DataFrame,
    Model,
    CallbackSinkNode,
    CallbackSourceNode,
    ModelBuilder,
    WorkerServiceProxy,
    WorkerServiceCall,
    WorkerServiceResponse,
    Service,
    PullOptions,
    PushOptions,
    DataService,
} from '../../'; // @openhps/core
import { Subject, Observable } from 'threads/observable';
import { expose } from 'threads';
import { DummyDataService, DummyService } from '../../service/_internal/';

let model: Model<any, any>;
const pullOutput: Subject<any> = new Subject();
const pushOutput: Subject<any> = new Subject();
const serviceOutputCall: Subject<WorkerServiceCall> = new Subject();
const serviceOutputResponse: Subject<WorkerServiceResponse> = new Subject();
const eventOutput: Subject<{
    name: string;
    event: any;
}> = new Subject();

/**
 * Init the model internal input and internal output
 *
 * @param {ModelBuilder} modelBuilder Model builder
 */
function initModel(modelBuilder: ModelBuilder<any, any>): void {
    const internalInput = new CallbackSourceNode((options?: PullOptions) => {
        // Send a pull request to the main thread
        pullOutput.next(options);
        return undefined;
    });
    const internalOutput = new CallbackSinkNode((frame: DataFrame) => {
        // Serialize the frame and transmit it to the main thread
        pushOutput.next(DataSerializer.serialize(frame));
    });

    modelBuilder.graph.deleteNode(modelBuilder.graph.internalInput);
    modelBuilder.graph.internalInput = internalInput;
    internalInput.on('error', (event: any) => {
        eventOutput.next({
            name: 'error',
            event,
        });
    });
    internalInput.on('completed', (event: any) => {
        eventOutput.next({
            name: 'completed',
            event,
        });
    });
    modelBuilder.graph.addNode(modelBuilder.graph.internalInput);
    modelBuilder.graph.deleteNode(modelBuilder.graph.internalOutput);
    modelBuilder.graph.internalOutput = internalOutput;
    modelBuilder.graph.addNode(modelBuilder.graph.internalOutput);
}

expose({
    /**
     * Worker intiailize
     *
     * @param {any} workerData Worker data containing model information
     * @returns {Promise<void>} Initialize promise
     */
    init(workerData: any): Promise<void> {
        return new Promise((resolve, reject) => {
            // Set global dir name
            // eslint-disable-next-line no-global-assign
            __dirname = workerData.dirname;
            // Load external scripts
            if (workerData.imports && workerData.imports.length > 0) {
                importScripts(workerData.imports);
            }
            // Create model
            const modelBuilder = ModelBuilder.create();
            // Add remote worker services if not already added
            workerData.services.forEach((service: any) => {
                if (service.dataType) {
                    const DataType = DataSerializer.findTypeByName(service.dataType);
                    modelBuilder.addService(
                        new DummyDataService(service.name, DataType),
                        new WorkerServiceProxy({
                            name: service.name,
                            callObservable: serviceOutputCall,
                            responseObservable: serviceOutputResponse,
                        }),
                    );
                } else {
                    modelBuilder.addService(
                        new DummyService(service.name),
                        new WorkerServiceProxy({
                            name: service.name,
                            callObservable: serviceOutputCall,
                            responseObservable: serviceOutputResponse,
                        }),
                    );
                }
            });

            initModel(modelBuilder);

            // eslint-disable-next-line
            const path = workerData.imports.lengths > 0 ? undefined : require('path');

            if (workerData.builder) {
                const traversalBuilder = modelBuilder.from();
                // eslint-disable-next-line
                const builderCallback = eval(workerData.builder);
                builderCallback(traversalBuilder, modelBuilder, workerData.args);
                traversalBuilder.to();
            } else {
                // eslint-disable-next-line
                const graph = require(path ? path.join(__dirname, workerData.shape) : workerData.shape);
                if (graph) {
                    modelBuilder.addShape(graph.default);
                }
            }

            modelBuilder
                .build()
                .then((m) => {
                    model = m;
                    resolve();
                })
                .catch(reject);
        });
    },
    /**
     * Pull from this work
     *
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    pull(options?: PullOptions): Promise<void> {
        return model.pull(options);
    },
    /**
     * Push to this worker
     *
     * @param {DataFrame} frame Data frame
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    push(frame: DataFrame, options?: PushOptions): Promise<void> {
        return model.push(DataSerializer.deserialize(frame), options);
    },
    /**
     * Input observable for pull requests
     *
     * @returns {Observable<void>} Observable input
     */
    pullOutput(): Observable<void> {
        return Observable.from(pullOutput);
    },
    /**
     * Output observable for push events
     *
     * @returns {Observable<any>} Observable output
     */
    pushOutput(): Observable<any> {
        return Observable.from(pushOutput);
    },
    eventOutput(): Observable<{
        name: string;
        event: any;
    }> {
        return Observable.from(eventOutput);
    },
    eventInput(name: string, event: any): void {
        model.emit(name as any, event);
    },
    /**
     * Outgoing call to a service on the main thread
     *
     * @returns {Observable<WorkerServiceCall>} Observable of outgoing service calls
     */
    serviceOutputCall(): Observable<WorkerServiceCall> {
        return Observable.from(serviceOutputCall);
    },
    /**
     * Response to an outgoing service call from the main thread
     *
     * @param {WorkerServiceResponse} input Service response
     */
    serviceOutputResponse(input: WorkerServiceResponse) {
        serviceOutputResponse.next(input);
    },
    serviceInputCall(call: WorkerServiceCall): Promise<WorkerServiceResponse> {
        return new Promise((resolve, reject) => {
            const service: Service = model.findDataService(call.serviceName) || model.findService(call.serviceName);
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
    },
    findAllServices(): Promise<any[]> {
        return new Promise((resolve) => {
            const services: Service[] = model.findAllServices();
            const servicesArray: any[] = services
                .filter((service) => !(service instanceof DummyDataService || service instanceof DummyService))
                .map((service) => {
                    // Services are wrapped in a proxy. Get prototype
                    const serviceBase = Object.getPrototypeOf(service);
                    return {
                        name: service.name,
                        type: serviceBase.constructor.name,
                        dataType: service instanceof DataService ? (service as any).driver.dataType.name : undefined,
                    };
                });
            resolve(servicesArray);
        });
    },
});
