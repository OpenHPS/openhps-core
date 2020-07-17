import { DataFrame, DataObject, ReferenceSpace } from "../../data";
import { GraphImpl } from "../_internal/implementations";
import { Node } from "../../Node";
import { AbstractSourceNode, AbstractEdge, AbstractGraph, AbstractSinkNode, AbstractNode } from "../interfaces";
import { EdgeBuilder } from "./EdgeBuilder";
import { TimeUnit } from "../../utils";
import { FrameChunkNode, FrameFlattenNode, FrameFilterNode, ObjectMergeNode, MemoryBufferNode } from "../../nodes/shapes";
import { ObjectFilterNode } from "../../nodes/shapes/ObjectFilterNode";
import { FrameDebounceNode } from "../../nodes/shapes/FrameDebounceNode";
import { ReferenceSpaceConversionNode } from "../../nodes/processing/ReferenceSpaceConversionNode";

/**
 * Graph builder
 */
export class GraphBuilder<In extends DataFrame | DataFrame[], Out extends DataFrame | DataFrame[]> {
    private _graph: GraphImpl<In, Out>;

    protected constructor(graph: GraphImpl<In, Out> = new GraphImpl()) {
        this._graph = graph;
        this.graph.name = "graph";
    }

    public static create<In extends DataFrame | DataFrame[], Out extends DataFrame | DataFrame[]>(): GraphBuilder<In, Out> {
        return new GraphBuilder();
    }

    public from(...nodes: Array<Node<any, any> | string>): GraphShapeBuilder<any> {
        const selectedNodes: Array<Node<any, any>> = new Array();
        nodes.forEach((node: Node<any, any> | string) => {
            if (typeof node === 'string') {
                let existingNode = this.graph.getNodeByUID(node);
                if (existingNode === undefined) {
                    existingNode = this.graph.getNodeByName(node);
                }
                selectedNodes.push(existingNode);
            } else {
                this.graph.addNode(node);
                if (node instanceof AbstractSourceNode) {
                    this.graph.addEdge(new EdgeBuilder<any>()
                        .withInput(this.graph.internalInput)
                        .withOutput(node)
                        .build());
                }
                selectedNodes.push(node);
            }
        });
        return new GraphShapeBuilder(this, this.graph, selectedNodes.length === 0 ? [this.graph.internalInput] : selectedNodes);
    }

    public addNode(node: AbstractNode<any, any>): GraphBuilder<In, Out> {
        this.graph.addNode(node);
        return this;
    }

    public addEdge(edge: AbstractEdge<any>): GraphBuilder<In, Out> {
        this.graph.addEdge(edge);
        return this;
    }

    public deleteEdge(edge: AbstractEdge<any>): GraphBuilder<In, Out> {
        this.graph.deleteEdge(edge);
        return this;
    }

    public deleteNode(node: AbstractNode<any, any>): GraphBuilder<In, Out> {
        this.graph.deleteNode(node);
        return this;
    }

    /**
     * Add graph shape to graph
     * @param graph Graph builder or abstract graph
     */
    public addShape(graph: GraphBuilder<any, any> | AbstractGraph<any, any>): GraphBuilder<In, Out> {
        if (graph instanceof GraphBuilder) {
            graph.graph.nodes.forEach(graphNode => {
                (graphNode as Node<any, any>).graph = this.graph;
                (graphNode as Node<any, any>).logger = this.graph.logger;
                this.addNode(graphNode);
            });
            graph.graph.edges.forEach(graphEdge => {
                this.addEdge(graphEdge);
            });
            // Connect internal and external output to shape 
            this.graph.addEdge(new EdgeBuilder<any>()
                .withInput(this.graph.internalInput)
                .withOutput(graph.graph.internalInput)
                .build());
            this.graph.addEdge(new EdgeBuilder<any>()
                .withInput(graph.graph.internalOutput)
                .withOutput(this.graph.internalOutput)
                .build());
        } else {
            // Add graph as node
            graph.nodes.forEach(graphNode => {
                (graphNode as Node<any, any>).graph = this.graph;
                (graphNode as Node<any, any>).logger = this.graph.logger;
            });
            this.from()
                .via(graph as unknown as Node<any, any>)
                .to();
        }
        return this;
    }

    public get graph(): GraphImpl<In, Out> {
        return this._graph;
    }

    public build(): Promise<AbstractGraph<In, Out>> {
        return new Promise((resolve, reject) => {
            this.graph.nodes.forEach(node => {
                node.logger = this.graph.logger;
            });
            this.graph.validate();
            this.graph.once('ready', () => {
                resolve(this.graph);
            });
            this.graph.emitAsync('build', this).catch(ex => {
                // Destroy model
                this.graph.emit('destroy');
                reject(ex);
            });
        });
    }
    
}

export class GraphShapeBuilder<Builder extends GraphBuilder<any, any>> {
    protected graphBuilder: Builder;
    protected previousNodes: Array<Node<any, any>>;
    protected graph: GraphImpl<any, any>;

    constructor(graphBuilder: Builder, graph: GraphImpl<any, any>, nodes: Array<Node<any, any>>) {
        this.graphBuilder = graphBuilder;
        this.previousNodes = nodes;
        this.graph = graph;
    }

    public via(...nodes: Array<Node<any, any> | string | AbstractGraph<any, any> | GraphBuilder<any, any>>): GraphShapeBuilder<Builder> {
        const selectedNodes: Array<Node<any, any>> = new Array();
        nodes.forEach(node => {
            if (node instanceof GraphBuilder) {
                node.graph.nodes.forEach(graphNode => {
                    (graphNode as Node<any, any>).graph = this.graph;
                    (graphNode as Node<any, any>).logger = this.graph.logger;
                    this.graph.addNode(graphNode);
                });
                node.graph.edges.forEach(graphEdge => {
                    this.graph.addEdge(graphEdge);
                });
                return this;
            } else if (node instanceof GraphImpl) {
                // Add graph as node
                node.nodes.forEach(graphNode => {
                    (graphNode as Node<any, any>).graph = this.graph;
                    (graphNode as Node<any, any>).logger = this.graph.logger;
                });
                return this.via(node as unknown as Node<any, any>);
            } else if (typeof node === 'string') {
                let existingNode = this.graph.getNodeByUID(node);
                if (existingNode === undefined) {
                    existingNode = this.graph.getNodeByName(node);
                }
                this.previousNodes.forEach(prevNode => {
                    this.graph.addEdge(new EdgeBuilder<any>()
                        .withInput(prevNode)
                        .withOutput(existingNode)
                        .build());
                });
                selectedNodes.push(existingNode);
            } else {
                this.graph.addNode(node);
                this.previousNodes.forEach(prevNode => {
                    this.graph.addEdge(new EdgeBuilder<any>()
                        .withInput(prevNode)
                        .withOutput(node)
                        .build());
                });
                selectedNodes.push(node as Node<any, any>);
            }
        });
        this.previousNodes = selectedNodes;
        return this;
    }

    public chunk(size: number, timeout?: number, timeoutUnit?: TimeUnit): GraphShapeBuilder<Builder> {
        return this.via(new FrameChunkNode(size, timeout, timeoutUnit));
    }

    public flatten(): GraphShapeBuilder<Builder> {
        return this.via(new FrameFlattenNode());
    }

    /**
     * Filter frames based on function
     * @param filterFn Filter function (true to keep, false to remove)
     */
    public filter(filterFn: (frame: DataFrame) => boolean): GraphShapeBuilder<Builder> {
        return this.via(new FrameFilterNode(filterFn));
    }

    /**
     * Filter objects inside frames
     * @param filterFn Filter function (true to keep, false to remove)
     */
    public filterObjects(filterFn: (object: DataObject, frame?: DataFrame) => boolean): GraphShapeBuilder<Builder> {
        return this.via(new ObjectFilterNode(filterFn));
    }

    /**
     * Merge objects
     * @param by Merge key
     * @param timeout Timeout
     * @param timeoutUnit Timeout unit
     */
    public merge(by: (frame: DataFrame) => boolean = _ => true, timeout: number = 100, timeoutUnit: TimeUnit = TimeUnit.MILLI): GraphShapeBuilder<Builder> {
        return this.via(new ObjectMergeNode((object: DataObject) => true, by, timeout, timeoutUnit)); 
    }

    public debounce(timeout: number = 100, timeoutUnit: TimeUnit = TimeUnit.MILLI): GraphShapeBuilder<Builder> {
        return this.via(new FrameDebounceNode(timeout, timeoutUnit));
    }

    public viaToReferenceSpace(referenceSpace: ReferenceSpace): GraphShapeBuilder<Builder> {
        return this.via(new ReferenceSpaceConversionNode(referenceSpace, false));
    }

    public viaFromReferenceSpace(referenceSpace: ReferenceSpace): GraphShapeBuilder<Builder> {
        return this.via(new ReferenceSpaceConversionNode(referenceSpace, true));
    }

    /**
     * Buffer pushed objects
     */
    public buffer(): GraphShapeBuilder<Builder> {
        return this.via(new MemoryBufferNode());
    }

    public to(...nodes: Array<AbstractSinkNode<any> | string>): Builder {
        if (nodes.length !== 0) {
            const selectedNodes: Array<AbstractSinkNode<any>> = new Array();
            nodes.forEach(node => {
                if (typeof node === 'string') {
                    let existingNode = this.graph.getNodeByUID(node);
                    if (existingNode === undefined) {
                        existingNode = this.graph.getNodeByName(node);
                    }
                    this.previousNodes.forEach(prevNode => {
                        this.graph.addEdge(new EdgeBuilder<any>()
                            .withInput(prevNode)
                            .withOutput(existingNode)
                            .build());
                    });
                    this.graph.addEdge(new EdgeBuilder<any>()
                        .withInput(existingNode)
                        .withOutput(this.graph.internalOutput)
                        .build());
                    selectedNodes.push(existingNode as AbstractSinkNode<any>);
                } else {
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
                    selectedNodes.push(node);
                }
            });
            this.previousNodes = selectedNodes; 
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
