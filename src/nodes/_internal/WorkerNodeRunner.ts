import 'reflect-metadata';
import {
    DataSerializer,
    DataFrame,
    Model,
    CallbackSinkNode,
    CallbackSourceNode,
    ModelBuilder,
    WorkerService,
} from '../../'; // @openhps/core
import { Subject, Observable } from 'threads/observable';
import { expose } from 'threads';
import { DummyDataService, DummyService } from '../../service/_internal/';
import { PullOptions, PushOptions } from '../../graph';

let model: Model<any, any>;
const pullOutput: Subject<any> = new Subject();
const pushOutput: Subject<any> = new Subject();
const serviceOutput: Subject<{
    id: string;
    serviceName: string;
    method: string;
    parameters: any;
}> = new Subject();
const serviceInput: Subject<{
    id: string;
    success: boolean;
    result?: any;
}> = new Subject();
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
        return null;
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
     */
    async init(workerData: any) {
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
                    new DummyDataService(DataType),
                    new WorkerService(service.name, serviceOutput, serviceInput),
                );
            } else {
                modelBuilder.addService(
                    new DummyService(),
                    new WorkerService(service.name, serviceOutput, serviceInput),
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

        model = await modelBuilder.build();
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
    serviceOutput(): Observable<{
        id: string;
        serviceName: string;
        method: string;
        parameters: any;
    }> {
        return Observable.from(serviceOutput);
    },
    serviceInput(id: string, success: boolean, result?: any) {
        serviceInput.next({ id, success, result });
    },
});
