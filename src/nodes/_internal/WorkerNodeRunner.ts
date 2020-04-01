import { DataSerializer, DataObject, DataFrame } from "../../data";
import { Model } from "../../Model";
import { Subject, Observable } from 'threads/observable';
import { CallbackSinkNode } from "../sink";
import { CallbackSourceNode } from "../source";
import { expose } from "threads";
import { WorkerDataObjectService } from "../../service/WorkerDataObjectService";
import { WorkerDataFrameService } from "../../service/WorkerDataFrameService";
import { ModelBuilder } from "../../ModelBuilder";

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
        modelBuilder.addService(new WorkerDataObjectService(DataObject, serviceInput, serviceOutput));
        modelBuilder.addService(new WorkerDataFrameService(DataFrame, serviceInput, serviceOutput));
        // Add source node with input observable
        const traversalBuilder = modelBuilder.from(new CallbackSourceNode(() => {
            input.next();
            return null;
        }));

        const path = require('path');
        builderCallback(traversalBuilder);

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
