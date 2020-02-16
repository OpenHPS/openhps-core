import { ModelBuilder } from "../../ModelBuilder";
import { expose } from "threads";
import { DataSerializer } from "../../data";
import { Model } from "../../Model";
import { Subject, Observable } from 'threads/observable';
import { CallbackSinkNode } from "../sink";
import { GraphPushOptions, GraphPullOptions } from "../../graph";
import { CallbackSourceNode } from "../source";

let model: Model<any, any>;
let input: Subject<{ options?: GraphPullOptions }> = new Subject();
let output: Subject<{ data: any, options?: GraphPushOptions }> = new Subject();

expose({
    init(workerData: any) {
        // Set global dir name
        __dirname = workerData.dirname;
        // Create model
        const builderCallback = eval(workerData.builderCallback);
        const modelBuilder = new ModelBuilder();
        modelBuilder.to(new CallbackSourceNode((options?: GraphPullOptions) => {
            input.next({ options: DataSerializer.serialize(options) });
            return null;
        }));

        const path = require('path');
        builderCallback(modelBuilder);

        modelBuilder.to(new CallbackSinkNode((data: any, options: GraphPushOptions) => {
            output.next({ data: DataSerializer.serialize(data), options: DataSerializer.serialize(options) });
        }));
        model = modelBuilder.build();
    },
    pull(options: any): Promise<void> {
        return model.pull(DataSerializer.deserialize(options));
    },
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