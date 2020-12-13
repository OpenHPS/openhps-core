import 'reflect-metadata';
import {
    DataSerializer,
    DataFrame,
    DataObject,
    Model,
    CallbackSinkNode,
    CallbackSourceNode,
    ModelBuilder,
    WorkerService,
    DataObjectService,
    NodeDataService,
    NodeData,
} from '../../'; // @openhps/core
import { Subject, Observable } from 'threads/observable';
import { expose } from 'threads';
import { DummyDataService, DummyService } from '../../service/_internal/';
import { PullOptions, PushOptions } from '../../graph';

let model: Model<any, any>;
const input: Subject<void> = new Subject();
const output: Subject<any> = new Subject();
const serviceInput: Subject<{
    id: string;
    serviceName: string;
    method: string;
    parameters: any;
}> = new Subject();
const serviceOutput: Subject<{
    id: string;
    success: boolean;
    result?: any;
}> = new Subject();

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
            switch (service.type) {
                case 'DataObjectService':
                    modelBuilder.addService(
                        new Proxy(
                            new DataObjectService(new DummyDataService(DataObject)),
                            new WorkerService(service.name, serviceInput, serviceOutput),
                        ),
                    );
                    break;
                case 'NodeDataService':
                    modelBuilder.addService(
                        new Proxy(
                            new NodeDataService(new DummyDataService(NodeData)),
                            new WorkerService(service.name, serviceInput, serviceOutput),
                        ),
                    );
                    break;
                case 'DataService':
                    modelBuilder.addService(
                        new Proxy(
                            new DummyDataService(null),
                            new WorkerService(service.name, serviceInput, serviceOutput),
                        ),
                    );
                    break;
                case 'Service':
                default:
                    modelBuilder.addService(
                        new Proxy(new DummyService(), new WorkerService(service.name, serviceInput, serviceOutput)),
                    );
                    break;
            }
        });

        modelBuilder.graph.deleteNode(modelBuilder.graph.internalInput);
        modelBuilder.graph.internalInput = new CallbackSourceNode(() => {
            // Send a pull request to the main thread
            input.next();
            return null;
        });
        modelBuilder.graph.addNode(modelBuilder.graph.internalInput);
        modelBuilder.graph.deleteNode(modelBuilder.graph.internalOutput);
        modelBuilder.graph.internalOutput = new CallbackSinkNode((frame: DataFrame) => {
            // Serialize the frame and transmit it to the main thread
            output.next(DataSerializer.serialize(frame));
        });
        modelBuilder.graph.addNode(modelBuilder.graph.internalOutput);

        if (workerData.builder) {
            const traversalBuilder = modelBuilder.from();
            // eslint-disable-next-line
            const path = require('path');
            // eslint-disable-next-line
            const builderCallback = eval(workerData.builder);
            builderCallback(traversalBuilder, modelBuilder, workerData.args);
            traversalBuilder.to();
        } else {
            // eslint-disable-next-line
            const path = require('path');
            // eslint-disable-next-line
            const graph = require(path.join(__dirname, workerData.shape));
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
    input(): Observable<void> {
        return Observable.from(input);
    },
    /**
     * Output observable for push requests
     *
     * @returns {Observable<any>} Observable output
     */
    output(): Observable<any> {
        return Observable.from(output);
    },
    serviceInput(): Observable<{
        id: string;
        serviceName: string;
        method: string;
        parameters: any;
    }> {
        return Observable.from(serviceInput);
    },
    serviceOutput(id: string, success: boolean, result?: any) {
        serviceOutput.next({ id, success, result });
    },
});
