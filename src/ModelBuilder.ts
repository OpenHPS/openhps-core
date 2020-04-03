import { Service } from "./service";
import { DataFrame, DataObject } from "./data";
import { AbstractEdge, EdgeBuilder } from "./graph";
import { Node } from "./Node";
import { ModelImpl } from "./graph/_internal/implementations";
import { AbstractSourceNode } from "./nodes/_internal/interfaces/AbstractSourceNode";
import { Model } from "./Model";
import { AbstractSinkNode } from "./nodes/_internal/interfaces/AbstractSinkNode";
import { ObjectMergeNode } from './nodes/shapes/ObjectMergeNode';
import { TimeUnit } from "./utils";
import { FrameFilterNode } from "./nodes/shapes/FrameFilterNode";
import { FrameDebounceNode } from "./nodes/shapes/FrameDebounceNode";
import { ObjectFilterNode } from "./nodes/shapes/ObjectFilterNode";
import { FrameChunkNode } from "./nodes/shapes/FrameChunkNode";

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
export class ModelBuilder<In extends DataFrame, Out extends DataFrame> {

    protected graph: ModelImpl<In, Out>;

    private constructor() {
        this.graph = new ModelImpl<In, Out>();
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

    /**
     * Add a service to the model
     * @param service Service to add
     */
    public addService(service: Service): ModelBuilder<In, Out> {
        this.graph.addService(service);
        return this;
    }

    public from(...nodes: Array<Node<any, any>>): ModelShapeBuilder {
        nodes.forEach(node => {
            this.graph.addNode(node);
            if (node instanceof AbstractSourceNode) {
                this.graph.addEdge(new EdgeBuilder<any>()
                    .withInput(this.graph.internalInput)
                    .withOutput(node)
                    .build());
            }
        });
        return new ModelShapeBuilder(this, this.graph, nodes.length === 0 ? [this.graph.internalInput] : nodes);
    }

    public addNode(node: Node<any, any>): ModelBuilder<In, Out> {
        this.graph.addNode(node);
        return this;
    }

    public addEdge(edge: AbstractEdge<any>): ModelBuilder<In, Out> {
        this.graph.addEdge(edge);
        return this;
    }

    public deleteEdge(edge: AbstractEdge<any>): ModelBuilder<In, Out> {
        this.graph.deleteEdge(edge);
        return this;
    }

    public deleteNode(node: Node<any, any>): ModelBuilder<In, Out> {
        this.graph.deleteNode(node);
        return this;
    }

    public build(): Promise<Model<In, Out>> {
        return new Promise((resolve, reject) => {
            this.graph.nodes.forEach(node => {
                node.logger = this.graph.logger;
            });
            this.graph.validate();
            this.graph.once('ready', () => {
                resolve(this.graph);
            });
            this.graph.emitAsync('build', this).catch(ex => {
                reject(ex);
            });
        });
    }
    
}

export class ModelShapeBuilder {
    protected graphBuilder: ModelBuilder<any, any>;
    protected previousNodes: Array<Node<any, any>>;
    protected graph: ModelImpl<any, any>;

    constructor(graphBuilder: ModelBuilder<any, any>, graph: ModelImpl<any, any>, nodes: Array<Node<any, any>>) {
        this.graphBuilder = graphBuilder;
        this.previousNodes = nodes;
        this.graph = graph;
    }

    public via(...nodes: Array<Node<any, any>>): ModelShapeBuilder {
        nodes.forEach(node => {
            this.previousNodes.forEach(prevNode => {
                this.graph.addNode(node);
                this.graph.addEdge(new EdgeBuilder<any>()
                    .withInput(prevNode)
                    .withOutput(node)
                    .build());
            });
        });
        this.previousNodes = nodes;
        return this;
    }

    public chunk(size: number, timeout: number = 100, timeoutUnit: TimeUnit = TimeUnit.MILLI): ModelShapeBuilder {
        return this.via(new FrameChunkNode());
    }

    public flatten(): ModelShapeBuilder {
        return this.via(new FrameChunkNode());
    }

    /**
     * Filter frames based on function
     * @param filterFn Filter function (true to keep, false to remove)
     */
    public filter(filterFn: (frame: DataFrame) => boolean): ModelShapeBuilder {
        return this.via(new FrameFilterNode(filterFn));
    }

    /**
     * Filter objects inside frames
     * @param filterFn Filter function (true to keep, false to remove)
     */
    public filterObjects(filterFn: (object: DataObject) => boolean): ModelShapeBuilder {
        return this.via(new ObjectFilterNode(filterFn));
    }

    /**
     * Merge objects
     * @param by Merge key
     * @param timeout Timeout
     * @param timeoutUnit Timeout unit
     */
    public merge(by: (frame: DataFrame) => boolean = _ => true, timeout: number = 100, timeoutUnit: TimeUnit = TimeUnit.MILLI): ModelShapeBuilder {
        return this.via(new ObjectMergeNode((_) => true, by, timeout, timeoutUnit)); 
    }

    public debounce(timeout: number = 100, timeoutUnit: TimeUnit = TimeUnit.MILLI): ModelShapeBuilder {
        return this.via(new FrameDebounceNode(timeout, timeoutUnit));
    }

    public to(...nodes: Array<AbstractSinkNode<any>>): ModelBuilder<any, any> {
        if (nodes.length !== 0) {
            nodes.forEach(node => {
                this.graph.addNode(node);
                this.previousNodes.forEach(prevNode => {
                    this.graph.addEdge(new EdgeBuilder<any>()
                        .withInput(prevNode)
                        .withOutput(node)
                        .build());
                });
                this.graph.addEdge(new EdgeBuilder<any>()
                    .withInput(node)
                    .withOutput(this.graph.internalOutput)
                    .build());
            });
            this.previousNodes = nodes; 
        } else {
            this.previousNodes.forEach(prevNode => {
                this.graph.addEdge(new EdgeBuilder<any>()
                    .withInput(prevNode)
                    .withOutput(this.graph.internalOutput)
                    .build());
            });
        }
        return this.graphBuilder;
    }

}
