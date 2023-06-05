import 'reflect-metadata';
import { DataFrame, DataObject, ReferenceSpace } from './data';
import { GraphValidator, ModelGraph } from './graph/_internal/implementations';
import { Model } from './Model';
import { GraphBuilder } from './graph/builders/GraphBuilder';
import { GraphShape } from './graph/_internal/implementations/GraphShape';
import { Service, NodeData, TimeService, DataObjectService, MemoryDataService, NodeDataService } from './service';

/**
 * Model builder to construct and build a {@link Model} consisting of graph shapes and services.
 *
 * ## Usage
 * Models can be created using the {@link ModelBuilder}. Once you have added all services and constructed the graph, you can build the model using the ```build()``` function. A promise will be returned with the created model.
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
    public graph: ModelGraph<any, any>;

    protected constructor() {
        super(new ModelGraph<In, Out>());
        this.graph.name = 'model';
        // Store data objects
        this.graph.addService(new DataObjectService(new MemoryDataService(DataObject)));
        // Store spaces in their own memory data object service
        this.graph.addService(new DataObjectService(new MemoryDataService(ReferenceSpace)));
        // Store node data
        this.graph.addService(new NodeDataService(new MemoryDataService(NodeData)));
        // Default time service using system time
        this.graph.addService(new TimeService());
    }

    public static create<In extends DataFrame, Out extends DataFrame>(): ModelBuilder<In, Out> {
        return new ModelBuilder();
    }

    /**
     * Model logger
     * @param {Function} logger Logging function
     * @returns {ModelBuilder} Model builder instance
     */
    public withLogger(logger: (level: string, message: string, data?: any) => void): this {
        this.graph.logger = logger;
        return this;
    }

    public withReferenceSpace(space: ReferenceSpace): this {
        (this.graph as ModelGraph<In, Out>).referenceSpace = space;
        return this;
    }

    /**
     * Add a service to the model
     * @param {Service} service Service to add
     * @param {ProxyHandler} [proxy] Proxy handler
     * @returns {ModelBuilder} Model builder instance
     */
    public addService(service: Service, proxy?: ProxyHandler<any>): this {
        (this.graph as ModelGraph<In, Out>).addService(service, proxy);
        return this;
    }

    /**
     * Add multiple services to the model
     * @param {Service[]} services Services to add
     * @returns {ModelBuilder} Model builder instance
     */
    public addServices(...services: Service[]): this {
        services.forEach((service) => this.addService(service));
        return this;
    }

    /**
     * Add graph shape to graph
     * @param {GraphBuilder | GraphShape | Model} shape Graph builder or abstract graph
     * @returns {GraphBuilder} Current graph builder instance
     */
    public addShape(shape: GraphBuilder<any, any> | GraphShape<any, any> | Model<any, any>): this {
        if (shape instanceof ModelGraph) {
            // Add services
            (shape as Model).findAllServices().forEach((service) => {
                this.addService(service);
            });
        } else if (shape instanceof ModelBuilder) {
            (shape.graph as Model).findAllServices().forEach((service) => {
                this.addService(service);
            });
        }
        return super.addShape(shape as GraphShape<any, any>);
    }

    public build(): Promise<Model<In, Out>> {
        return new Promise((resolve, reject) => {
            GraphValidator.validate(this.graph);
            this.graph.once('ready', () => {
                resolve(this.graph as Model<In, Out>);
            });
            this.graph.emitAsync('build', this).catch((ex) => {
                // Destroy model
                this.graph.emit('destroy');
                reject(ex);
            });
        });
    }
}
