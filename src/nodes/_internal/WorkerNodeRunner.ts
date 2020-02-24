import { ModelBuilder } from "../../ModelBuilder";
import { expose } from "threads";
import { DataSerializer } from "../../data";
import { Model } from "../../Model";
import { Subject, Observable } from 'threads/observable';
import { CallbackSinkNode } from "../sink";
import { GraphPushOptions, GraphPullOptions } from "../../graph";
import { CallbackSourceNode } from "../source";

let model: Model<any, any>;
const input: Subject<{ options?: GraphPullOptions }> = new Subject();
const output: Subject<{ data: any, options?: GraphPushOptions }> = new Subject();

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
        const modelBuilder = new ModelBuilder();
        const traversalBuilder = modelBuilder.from(new CallbackSourceNode((options?: GraphPullOptions) => {
            input.next({ options: DataSerializer.serialize(options) });
            return null;
        }));

        const path = require('path');
        builderCallback(traversalBuilder);

        traversalBuilder.to(new CallbackSinkNode((data: any, options: GraphPushOptions) => {
            output.next({ data: DataSerializer.serialize(data), options: DataSerializer.serialize(options) });
        }));
        model = await modelBuilder.build();
    },
    /**
     * Pull from this work
     * @param options 
     */
    pull(options: any): Promise<void> {
        return model.pull(DataSerializer.deserialize(options));
    },
    /**
     * Push to this worker
     * @param data 
     * @param options 
     */
    push(data: any, options: any): Promise<void> {
        return model.push(DataSerializer.deserialize(data), DataSerializer.deserialize(options));
    },
    input(): Observable<{ options?: GraphPullOptions }> {
        return Observable.from(input);
    },
    output(): Observable<{ data: any, options?: GraphPushOptions }> {
        return Observable.from(output);
    }
});
