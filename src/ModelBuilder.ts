import { Service } from "./service";
import { DataFrame, Space } from "./data";
import { ModelImpl } from "./graph/_internal/implementations";
import { Model } from "./Model";
import { GraphBuilder } from "./graph/builders/GraphBuilder";

/**
 * Model build to construct and build a [[Model]]
 * 
 * ## Usage
 * ```typescript
 * ModelBuilder.create()
 *      .withLogger((level: string, log:any) => { console.log(log); })
 *      .from(...)
 *      .via(...)
 *      .to(...)
 *      .addService(...)
 *      .build().then(model => {
 *          // Model created
 *      });
 * ```
 */
export class ModelBuilder<In extends DataFrame | DataFrame[] = DataFrame, Out extends DataFrame | DataFrame[] = DataFrame> extends GraphBuilder<In, Out> {

    protected constructor() {
        super(new ModelImpl<In, Out>());
        this.graph.name = "model";
    }

    public static create<In extends DataFrame | DataFrame[] = DataFrame, Out extends DataFrame | DataFrame[] = DataFrame>(): ModelBuilder<In, Out> {
        return new ModelBuilder();
    }

    /**
     * Model logger
     * @param logger Logging function 
     */
    public withLogger(logger: (level: string, log: any) => void): ModelBuilder<In, Out> {
        this.graph.logger = logger;
        return this;
    }

    public withBaseSpace(space: Space): ModelBuilder<In, Out> {
        (this.graph as ModelImpl<In, Out>).baseSpace = space;
        return this;
    }

    /**
     * Add a service to the model
     * @param service Service to add
     */
    public addService(service: Service): ModelBuilder<In, Out> {
        (this.graph as ModelImpl<In, Out>).addService(service);
        return this;
    }

    public build(): Promise<Model<In, Out>> {
        return new Promise((resolve, reject) => {
            this.graph.nodes.forEach(node => {
                node.logger = this.graph.logger;
            });
            (this.graph as ModelImpl<In, Out>).findAllServices().forEach(service => {
                service.logger = this.graph.logger;
            });
            this.graph.validate();
            this.graph.once('ready', () => {
                resolve(this.graph as Model<In, Out>);
            });
            this.graph.emitAsync('build', this).catch(ex => {
                // Destroy model
                this.graph.emit('destroy');
                reject(ex);
            });
        });
    }
    
}
