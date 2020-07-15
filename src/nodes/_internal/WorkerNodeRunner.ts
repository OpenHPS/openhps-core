import 'reflect-metadata';
import { DataSerializer, DataObject, DataFrame } from "../../data";
import { Model } from "../../Model";
import { Subject, Observable } from 'threads/observable';
import { CallbackSinkNode } from "../sink";
import { CallbackSourceNode } from "../source";
import { expose } from "threads";
import { ModelBuilder } from "../../ModelBuilder";
import { WorkerService } from "../../service/WorkerService";
import { DummyService } from "../../service/_internal/DummyService";
import { DummyDataObjectService } from "../../service/_internal/DummyDataObjectService";
import { DummyDataFrameService } from "../../service/_internal/DummyDataFrameService";
import { DummyDataService } from "../../service/_internal/DummyDataService";

let model: Model<any, any>;
const input: Subject<void> = new Subject();
const output: Subject<any> = new Subject();
const serviceInput: Subject<{ id: string, serviceName: string, method: string, parameters: any }> = new Subject();
const serviceOutput: Subject<{ id: string, success: boolean, result?: any}> = new Subject();

expose({
    /**
     * Worker intiailize
     * @param workerData Worker data containing model information 
     */
    async init(workerData: any) {
        // Set global dir name
        __dirname = workerData.dirname;
        // Create model
        // tslint:disable-next-line
        const builderCallback = eval(workerData.builderCallback);
        const modelBuilder = ModelBuilder.create();
        // Add remote worker services
        workerData.services.forEach((service: any) => {
            switch (service.type) {
                case "DataObjectService":
                    modelBuilder.addService(new Proxy(new DummyDataObjectService(), new WorkerService(service.name, serviceInput, serviceOutput)));
                    break;
                case "DataFrameService":
                    modelBuilder.addService(new Proxy(new DummyDataFrameService(), new WorkerService(service.name, serviceInput, serviceOutput)));
                    break;
                case "DataService":
                    modelBuilder.addService(new Proxy(new DummyDataService(null), new WorkerService(service.name, serviceInput, serviceOutput)));
                    break;
                case "Service":
                default:
                    modelBuilder.addService(new Proxy(new DummyService(), new WorkerService(service.name, serviceInput, serviceOutput)));
                    break;
            }
        });
        // Add source node with input observable
        const traversalBuilder = modelBuilder.from(new CallbackSourceNode(() => {
            input.next();
            return null;
        }));

        const path = require('path');
        builderCallback(traversalBuilder, modelBuilder);

        traversalBuilder.to(new CallbackSinkNode((frame: DataFrame) => {
            output.next(DataSerializer.serialize(frame));
        }));
        model = await modelBuilder.build();
    },
    /**
     * Pull from this work
     */
    pull(): Promise<void> {
        return model.pull();
    },
    /**
     * Push to this worker
     * @param frame
     */
    push(frame: any): Promise<void> {
        return model.push(DataSerializer.deserialize(frame));
    },
    /**
     * Input observable for pull requests
     */
    input(): Observable<void> {
        return Observable.from(input);
    },
    /**
     * Output observable for push requests
     */
    output(): Observable<any> {
        return Observable.from(output);
    },
    serviceInput(): Observable<{ id: string, serviceName: string, method: string, parameters: any }> {
        return Observable.from(serviceInput);
    },
    serviceOutput(id: string, success: boolean, result?: any) {
        serviceOutput.next({ id, success, result });
    }
});
