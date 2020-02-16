import { Model } from "./Model";
import { Service, DataService, DataServiceDriver } from "./service";
import { DataFrame } from "./data";
import { ModelImpl } from './graph/_internal/implementations/ModelImpl';
import { GraphBuilder } from "./graph/builders";
import { rejects } from "assert";

/**
 * Model build to construct and build a [[Model]]
 * 
 * ## Usage
 * ```typescript
 * const model = new ModelBuilder()
 *      .withLogger((level: string, log:any) => { console.log(log); })
 *      .to(...)
 *      .to(...)
 *      .addService(...)
 *      .build();
 * ```
 */
export class ModelBuilder<In extends DataFrame, Out extends DataFrame> extends GraphBuilder<In, Out, ModelBuilder<In, Out>> {
    protected graph: ModelImpl<In, Out>;

    private constructor() {
        super();
        this.graph = new ModelImpl<In, Out>();
        this.graph.name = "model";
    }

    public static create<In extends DataFrame, Out extends DataFrame>(): ModelBuilder<In, Out> {
        return new ModelBuilder<In, Out>();
    }

    /**
     * Model logger
     * @param logger Logging function 
     */
    public withLogger(logger: (level: string, log: any) => void): ModelBuilder<In, Out> {
        this.graph.logger = logger;
        return this;
    }

    public usingDataServiceDriver(driver: new (dataType: new () => any, options?: any) => DataServiceDriver<any, any>, options?: any): ModelBuilder<In, Out> {
        this.graph.setDefaultDataServiceDriver({ type: driver, options });
        return this;
    }

    /**
     * Add a service to the model
     * @param service Service to add
     */
    public addService(service: Service): ModelBuilder<In, Out> {
        this.graph.addService(service);
        return this;
    }

    /**
     * Finalize the model
     */
    public build(): Promise<Model<In, Out>> {
        return new Promise((resolve, reject) => {
            super.build().then(_ => {
                return this.graph;
            }).catch(ex => {
                rejects(ex);
            });
        });
    }
    
}
