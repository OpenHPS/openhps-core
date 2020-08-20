import { DataFrame, DataObject, ReferenceSpace } from '../../data';
import { GraphImpl } from '../_internal/implementations';
import { Node } from '../../Node';
import { AbstractSourceNode, AbstractEdge, AbstractGraph, AbstractSinkNode, AbstractNode } from '../interfaces';
import { EdgeBuilder } from './EdgeBuilder';
import { TimeUnit } from '../../utils';
import {
    FrameChunkNode,
    FrameFlattenNode,
    FrameFilterNode,
    ObjectMergeNode,
    MemoryBufferNode,
} from '../../nodes/shapes';
import { ObjectFilterNode } from '../../nodes/shapes/ObjectFilterNode';
import { FrameDebounceNode } from '../../nodes/shapes/FrameDebounceNode';
import { ReferenceSpaceConversionNode } from '../../nodes/processing/ReferenceSpaceConversionNode';

/**
 * Graph builder
 */
export class GraphBuilder<In extends DataFrame, Out extends DataFrame> {
    private _graph: GraphImpl<In, Out>;

    protected constructor(graph: GraphImpl<In, Out> = new GraphImpl()) {
        this._graph = graph;
        this.graph.name = 'graph';
    }

    public static create<In extends DataFrame, Out extends DataFrame>(): GraphBuilder<In, Out> {
        return new GraphBuilder();
    }

    public from(...nodes: Array<Node<any, any> | string>): GraphShapeBuilder<any> {
        const selectedNodes: Array<Node<any, any>> = [];
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
                    this.graph.addEdge(EdgeBuilder.create().from(this.graph.internalInput).to(node).build());
                }
                selectedNodes.push(node);
            }
        });
        return new GraphShapeBuilder(
            this,
            this.graph,
            selectedNodes.length === 0 ? [this.graph.internalInput] : selectedNodes,
        );
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
     *
     * @param {GraphBuilder | AbstractGraph} graph Graph builder or abstract graph
     * @returns {GraphBuilder} Current graph builder instance
     */
    public addShape(graph: GraphBuilder<any, any> | AbstractGraph<any, any>): GraphBuilder<In, Out> {
        this.from().via(graph).to();
        if (graph instanceof GraphBuilder) {
            // Connect internal and external output to shape
            this.graph.addEdge(
                EdgeBuilder.create().from(this.graph.internalInput).to(graph.graph.internalInput).build(),
            );
            this.graph.addEdge(
                EdgeBuilder.create().from(graph.graph.internalOutput).to(this.graph.internalOutput).build(),
            );
        }
        return this;
    }

    public get graph(): GraphImpl<In, Out> {
        return this._graph;
    }

    public build(): Promise<AbstractGraph<In, Out>> {
        return new Promise((resolve, reject) => {
            this.graph.nodes.forEach((node) => {
                node.logger = this.graph.logger;
            });
            this.graph.validate();
            this.graph.once('ready', () => {
                resolve(this.graph);
            });
            this.graph.emitAsync('build', this).catch((ex) => {
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

    protected viaGraphBuilder(graphBuilder: GraphBuilder<any, any>): GraphShapeBuilder<Builder> {
        graphBuilder.graph.nodes.forEach((graphNode) => {
            (graphNode as Node<any, any>).graph = this.graph;
            (graphNode as Node<any, any>).logger = this.graph.logger;
            this.graph.addNode(graphNode);
        });
        graphBuilder.graph.edges.forEach((graphEdge) => {
            this.graph.addEdge(graphEdge);
        });
        return this;
    }

    protected viaGraph(graph: AbstractGraph<any, any>): GraphShapeBuilder<Builder> {
        // Add graph as node
        graph.nodes.forEach((graphNode) => {
            (graphNode as Node<any, any>).graph = this.graph;
            (graphNode as Node<any, any>).logger = this.graph.logger;
        });
        return this.via((graph as unknown) as Node<any, any>);
    }

    public via(
        ...nodes: Array<Node<any, any> | string | AbstractGraph<any, any> | GraphBuilder<any, any>>
    ): GraphShapeBuilder<Builder> {
        const selectedNodes: Array<Node<any, any>> = [];
        nodes.forEach((node) => {
            if (node instanceof GraphBuilder) {
                return this.viaGraphBuilder(node);
            } else if (node instanceof GraphImpl) {
                return this.viaGraph(node);
            } else {
                let nodeObject: Node<any, any>;
                if (typeof node === 'string') {
                    nodeObject = this.graph.getNodeByUID(node);
                    if (nodeObject === undefined) {
                        nodeObject = this.graph.getNodeByName(node);
                    }
                } else {
                    this.graph.addNode(node);
                    nodeObject = node as Node<any, any>;
                }

                this._insertNode(nodeObject);
                selectedNodes.push(nodeObject);
            }
        });
        this.previousNodes = selectedNodes;
        return this;
    }

    /**
     * Insert a new node in the existing graph
     *
     * @param {Node} node Node to insert
     */
    private _insertNode(node: Node<any, any>): void {
        this.previousNodes.forEach((prevNode) => {
            this.graph.addEdge(EdgeBuilder.create().from(prevNode).to(node).build());
        });
    }

    public chunk(size: number, timeout?: number, timeoutUnit?: TimeUnit): GraphShapeBuilder<Builder> {
        return this.via(new FrameChunkNode(size, timeout, timeoutUnit));
    }

    public flatten(): GraphShapeBuilder<Builder> {
        return this.via(new FrameFlattenNode());
    }

    /**
     * Filter frames based on function
     *
     * @param {Function} filterFn Filter function (true to keep, false to remove)
     * @returns {GraphShapeBuilder} Current graph builder instance
     */
    public filter(filterFn: (object: DataObject, frame?: DataFrame) => boolean): GraphShapeBuilder<Builder>;
    public filter(filterFn: (frame: DataFrame) => boolean): GraphShapeBuilder<Builder>;
    public filter(filterFn: (_?: any) => boolean): GraphShapeBuilder<Builder> {
        return this.via(new FrameFilterNode(filterFn));
    }

    /**
     * Filter objects inside frames
     *
     * @param {Function} filterFn Filter function (true to keep, false to remove)
     * @returns {GraphShapeBuilder} Current graph builder instance
     */
    public filterObjects(filterFn: (object: DataObject, frame?: DataFrame) => boolean): GraphShapeBuilder<Builder> {
        return this.via(new ObjectFilterNode(filterFn));
    }

    /**
     * Merge objects
     *
     * @param {Function} by Merge key
     * @param {number} timeout Timeout
     * @param {TimeUnit} timeoutUnit Timeout unit
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public merge(
        by: (frame: DataFrame) => boolean = () => true,
        timeout = 100,
        timeoutUnit = TimeUnit.MILLISECOND,
    ): GraphShapeBuilder<Builder> {
        return this.via(new ObjectMergeNode(() => true, by, timeout, timeoutUnit));
    }

    public debounce(timeout = 100, timeoutUnit = TimeUnit.MILLISECOND): GraphShapeBuilder<Builder> {
        return this.via(new FrameDebounceNode(timeout, timeoutUnit));
    }

    /**
     * Convert positions of all objects to a certain reference space
     *
     * @param {ReferenceSpace | string} referenceSpace Reference space to convert to
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public convertToSpace(referenceSpace: ReferenceSpace | string): GraphShapeBuilder<Builder> {
        return this.via(new ReferenceSpaceConversionNode(referenceSpace, false));
    }

    /**
     * Convert positions of all objects from a certain reference space
     *
     * @param {ReferenceSpace | string} referenceSpace Reference space to convert from
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public convertFromSpace(referenceSpace: ReferenceSpace | string): GraphShapeBuilder<Builder> {
        return this.via(new ReferenceSpaceConversionNode(referenceSpace, true));
    }

    /**
     * Buffer pushed objects
     *
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public buffer(): GraphShapeBuilder<Builder> {
        return this.via(new MemoryBufferNode());
    }

    public to(...nodes: Array<AbstractSinkNode<any> | string>): Builder {
        if (nodes.length !== 0) {
            const selectedNodes: Array<AbstractSinkNode<any>> = [];
            nodes.forEach((node) => {
                let nodeObject: Node<any, any>;
                if (typeof node === 'string') {
                    nodeObject = this.graph.getNodeByUID(node);
                    if (nodeObject === undefined) {
                        nodeObject = this.graph.getNodeByName(node);
                    }
                } else {
                    this.graph.addNode(node);
                    nodeObject = node;
                }

                this._insertNode(nodeObject);
                this.graph.addEdge(EdgeBuilder.create().from(nodeObject).to(this.graph.internalOutput).build());
                selectedNodes.push(nodeObject as AbstractSinkNode<any>);
            });
            this.previousNodes = selectedNodes;
        } else {
            this._insertNode(this.graph.internalOutput);
        }
        return this.graphBuilder;
    }
}
