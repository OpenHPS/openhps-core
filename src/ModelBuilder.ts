import { Model } from "./Model";
import { Service } from "./service";
import { DataFrame } from "./data";
import { GraphBuilder } from "./graph";
import { ModelImpl } from './graph/_internal/implementations/ModelImpl';

/**
 * Model build to construct and build a [[Model]]
 * 
 * ## Usage
 * ```typescript
 * const model = new ModelBuilder()
 *      .withLogger((level: string, log:any) => { console.log(log); })
 *      .withLayer(...)
 *      .withLayer(...)
 *      .withService(...)
 *      .build();
 * ```
 */
export class ModelBuilder<In extends DataFrame, Out extends DataFrame> extends GraphBuilder<In, Out, ModelBuilder<In, Out>> {
    protected graph: ModelImpl<In, Out>;

    constructor() {
        super();
        this.graph = new ModelImpl<In, Out>();
        this.previousNodes = [this.graph.internalInput];
        this.graph.setName("model");
    }

    public withLogger(logger: (level: string, log: any) => void): ModelBuilder<In, Out> {
        this.graph.setLogger(logger);
        return this;
    }

    public withService(service: Service): ModelBuilder<In, Out> {
        this.graph.addService(service);
        return this;
    }

    /**
     * Finalize the model
     */
    public build(): Model<In, Out> {
        super.build();
        return this.graph;
    }
    
}
