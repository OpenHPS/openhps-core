import 'reflect-metadata';
import { Service } from "./service";
import { DataFrame, ReferenceSpace } from "./data";
import { ModelImpl } from "./graph/_internal/implementations";
import { Model } from "./Model";
import { GraphBuilder } from "./graph/builders/GraphBuilder";

/**
 * Model builder to construct and build a [[Model]] consisting of graph shapes and services.
 * 
 * ## Usage
 * Models can be created using the [[ModelBuilder]]. Once you have added all services and constructed the graph, you can build the model using the ```build()``` function. A promise will be returned with the created model.
 * 
 * ```typescript
 * import { ModelBuilder } from '@openhps/core';
 * 
 * ModelBuilder.create()
 *     .build().then(model => {
 *         // ...
 *     });
 * ```
 * The graph shape of a model is immutable and can not be altered after building.
 * 
 * ### Shape Builder
 * Shapes can be created by starting with the ```from()``` function. This function takes an optional
 * parameter of one or multiple [source nodes](#sourcenode).
 * 
 * In order to end a shape, the ```to()``` function needs to be called with one or more optional [sink nodes](#sinknode).
 * ```typescript
 * import { ModelBuilder } from '@openhps/core';
 * 
 * ModelBuilder.create()
 *     .from()
 *     .to()
 *     .build().then(model => {
 *         // ...
 *     });
 * ```
 * 
 * Alternatively for readability with multiple shapes, the shapes can individually be created using the ```addShape()``` function as shown below.
 * ```typescript
 * import { ModelBuilder, GraphBuilder } from '@openhps/core';
 * 
 * ModelBuilder.create()
 *     .addShape(
 *       GraphBuilder.create()
 *         .from()
 *         .to())
 *     .build().then(model => {
 *         // ...
 *     });
 * ```
 * 
 * #### Building Source Processors
 * It is possible to have multiple processing nodes between the source and sink. These processing nodes can manipulate the data frame
 * when it traverses from node to node.
 * ```typescript
 * import { ModelBuilder } from '@openhps/core';
 * 
 * ModelBuilder.create()
 *     .from(...)
 *     .via(new ComputingNode())
 *     .via(new AnotherComputingNode())
 *     .to(...)
 *     .build().then(model => {
 *         // ...
 *     });
 * ```
 * 
 * #### Helper Functions
 * Helper functions can replace the ```via()``` function. Commonly used nodes such as frame filters, merging of data frames from
 * multiple sources, ... can be replaced with simple functions as ```filter()``` or ```merge()``` respectively.
 * ```typescript
 * import { ModelBuilder } from '@openhps/core';
 * import { CSVSourceNode, CSVSinkNode } from '@openhps/csv';
 * 
 * ModelBuilder.create()
 *     .from(
 *         new CSVSourceNode('scanner1.csv', ...),
 *         new CSVSourceNode('scanner2.csv', ...),
 *         new CSVSourceNode('scanner3.csv', ...)
 *     )
 *     .filter((frame: DataFrame) => true)
 *     .merge((frame: DataFrame) => frame.source.uid)
 *     .via(new ComputingNode())
 *     .via(new AnotherComputingNode())
 *     .to(new CSVSinkNode('output.csv', ...))
 *     .build().then(model => {
 *         // ...
 *     });
 * ```
 * 
 * ### Debug Logging
 * When building the model, you can provide a logger callback that has two arguments. An error level complying
 * with normal log levels and a log object that represents an object.
 * ```typescript
 * import { ModelBuilder } from '@openhps/core';
 * 
 * ModelBuilder.create()
 *     // Set the logger that will be used by all nodes and services
 *     .withLogger((level: string, log: any) => { 
 *         console.log(log); 
 *     })
 *     // ...
 *     .build().then(model => {
 *      // ...
 *     });
 * ```
 * 
 * ### Adding Services
 * Adding services can be done using the ```addService()``` function in the model builder.
 * ```typescript
 * import { ModelBuilder } from '@openhps/core';
 * 
 * ModelBuilder.create()
 *     .addService(...)
 *     // ...
 *     .build().then(model => {
 * 
 *     });
 * ```
 */
export class ModelBuilder<In extends DataFrame, Out extends DataFrame> extends GraphBuilder<In, Out> {

    protected constructor() {
        super(new ModelImpl<In, Out>());
        this.graph.name = "model";
    }

    public static create<In extends DataFrame, Out extends DataFrame>(): ModelBuilder<In, Out> {
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

    public withReferenceSpace(space: ReferenceSpace): ModelBuilder<In, Out> {
        (this.graph as ModelImpl<In, Out>).referenceSpace = space;
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
