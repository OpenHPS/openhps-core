import { DataFrame, DataObject, ReferenceSpace } from '../../data';
import { Node } from '../../Node';
import { TimeUnit } from '../../utils';
import {
    FrameChunkNode,
    FrameFlattenNode,
    FrameFilterNode,
    ObjectMergeNode,
    MemoryBufferNode,
    FrameCloneNode,
} from '../../nodes/shapes';
import { GraphShape } from '../GraphShape';
import { ObjectFilterNode } from '../../nodes/shapes/ObjectFilterNode';
import { FrameDebounceNode } from '../../nodes/shapes/FrameDebounceNode';
import { ReferenceSpaceConversionNode } from '../../nodes/processing/ReferenceSpaceConversionNode';
import { PlaceholderNode } from '../../nodes/_internal/PlaceholderNode';
import { CallbackSinkNode, SinkNode, SourceNode } from '../../nodes';
import { Edge } from '../Edge';

/**
 * Graph builder
 *
 * @category Graph
 */
export class GraphBuilder<In extends DataFrame, Out extends DataFrame> {
    private _graph: GraphShape<In, Out>;

    protected constructor(graph: GraphShape<In, Out> = new GraphShape()) {
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
                let nodeObject = this.graph.findNodeByUID(node) || this.graph.findNodeByName(node);
                if (nodeObject === undefined) {
                    // Add a placeholder
                    nodeObject = new PlaceholderNode(node);
                }
                this.graph.addNode(nodeObject);
                selectedNodes.push(nodeObject);
            } else {
                this.graph.addNode(node);
                if (node instanceof SourceNode) {
                    this.graph.addEdge(new Edge(this.graph.internalInput, node));
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

    public addNode(node: Node<any, any>): this {
        this.graph.addNode(node);
        return this;
    }

    public addEdge(edge: Edge<any>): this {
        this.graph.addEdge(edge);
        return this;
    }

    public deleteEdge(edge: Edge<any>): this {
        this.graph.deleteEdge(edge);
        return this;
    }

    public deleteNode(node: Node<any, any>): this {
        this.graph.deleteNode(node);
        return this;
    }

    /**
     * Add graph shape to graph
     *
     * @param {GraphBuilder | GraphShape} shape Graph builder or abstract graph
     * @returns {GraphBuilder} Current graph builder instance
     */
    public addShape(shape: GraphBuilder<any, any> | GraphShape<any, any>): this {
        let graph: GraphShape<any, any>;
        if (shape instanceof GraphBuilder) {
            graph = shape.graph;
        } else {
            graph = shape;
        }

        // Add the graph node and edges
        graph.nodes.forEach((node) => {
            // Check if the node is a placeholder
            if (node instanceof PlaceholderNode) {
                // Try to find a node with the same uid/name as the placeholder node
                const existingNode = this.graph.findNodeByUID(node.name) || this.graph.findNodeByName(node.name);
                if (existingNode) {
                    // Edit the edges connected to this placeholder
                    const outputEdges = graph.edges.filter((edge) => edge.inputNode === node);
                    const inputEdges = graph.edges.filter((edge) => edge.outputNode === node);
                    outputEdges.map((edge) => (edge.inputNode = existingNode));
                    inputEdges.map((edge) => (edge.outputNode = existingNode));
                    this.addNode(existingNode);
                } else {
                    // Add the node as a placeholder
                    this.addNode(node);
                }
            } else {
                this.addNode(node);
            }
        });
        graph.edges.forEach((edge) => {
            this.addEdge(edge);
        });

        // Connect internal and external output to shape
        this.graph.addEdge(new Edge(this.graph.internalInput, graph.internalInput));
        this.graph.addEdge(new Edge(graph.internalOutput, this.graph.internalOutput));
        return this;
    }

    public get graph(): GraphShape<In, Out> {
        return this._graph;
    }

    public build(): Promise<GraphShape<In, Out>> {
        return new Promise((resolve, reject) => {
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
    protected graph: GraphShape<any, any>;

    constructor(graphBuilder: Builder, graph: GraphShape<any, any>, nodes: Array<Node<any, any>>) {
        this.graphBuilder = graphBuilder;
        this.previousNodes = nodes;
        this.graph = graph;
    }

    protected viaGraphBuilder(graphBuilder: GraphBuilder<any, any>): this {
        graphBuilder.graph.nodes.forEach((graphNode) => {
            (graphNode as Node<any, any>).graph = this.graph;
            this.graph.addNode(graphNode);
        });
        graphBuilder.graph.edges.forEach((graphEdge) => {
            this.graph.addEdge(graphEdge);
        });
        return this;
    }

    protected viaGraph(graph: GraphShape<any, any>): this {
        // Add graph as node
        graph.nodes.forEach((graphNode) => {
            (graphNode as Node<any, any>).graph = this.graph;
        });
        this.graph.addNode(graph);
        this._insertNode(graph);
        this.previousNodes = [graph];
        return this;
    }

    public via(...nodes: Array<Node<any, any> | string | GraphShape<any, any> | GraphBuilder<any, any>>): this {
        const selectedNodes: Array<Node<any, any>> = [];
        nodes.forEach((node) => {
            if (node instanceof GraphBuilder) {
                return this.viaGraphBuilder(node);
            } else if (node instanceof GraphShape) {
                return this.viaGraph(node);
            } else {
                let nodeObject: Node<any, any>;
                if (typeof node === 'string') {
                    nodeObject = this.graph.findNodeByUID(node) || this.graph.findNodeByName(node);
                    if (nodeObject === undefined) {
                        // Add a placeholder
                        nodeObject = new PlaceholderNode(node);
                    }
                } else {
                    nodeObject = node as Node<any, any>;
                }

                this.graph.addNode(nodeObject);
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
            this.graph.addEdge(new Edge(prevNode, node));
        });
    }

    public chunk(size: number, timeout?: number, timeoutUnit?: TimeUnit): this {
        return this.via(new FrameChunkNode(size, timeout, timeoutUnit));
    }

    public flatten(): this {
        return this.via(new FrameFlattenNode());
    }

    /**
     * Filter frames based on function
     *
     * @param {Function} filterFn Filter function (true to keep, false to remove)
     * @returns {GraphShapeBuilder} Current graph builder instance
     */
    public filter(filterFn: (object: DataObject, frame?: DataFrame) => boolean): this;
    public filter(filterFn: (frame: DataFrame) => boolean): this;
    public filter(filterFn: (_?: any) => boolean): this {
        return this.via(new FrameFilterNode(filterFn));
    }

    /**
     * Filter objects inside frames
     *
     * @param {Function} filterFn Filter function (true to keep, false to remove)
     * @returns {GraphShapeBuilder} Current graph builder instance
     */
    public filterObjects(filterFn: (object: DataObject, frame?: DataFrame) => boolean): this {
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
    ): this {
        return this.via(
            new ObjectMergeNode(by, {
                timeout,
                timeoutUnit,
            }),
        );
    }

    public debounce(timeout = 100, timeoutUnit = TimeUnit.MILLISECOND): this {
        return this.via(new FrameDebounceNode(timeout, timeoutUnit));
    }

    /**
     * Clone frames
     *
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public clone(): this {
        return this.via(new FrameCloneNode());
    }

    /**
     * Convert positions of all objects to a certain reference space
     *
     * @param {ReferenceSpace | string} referenceSpace Reference space to convert to
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public convertToSpace(referenceSpace: ReferenceSpace | string): this {
        return this.via(new ReferenceSpaceConversionNode(referenceSpace, false));
    }

    /**
     * Convert positions of all objects from a certain reference space
     *
     * @param {ReferenceSpace | string} referenceSpace Reference space to convert from
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public convertFromSpace(referenceSpace: ReferenceSpace | string): this {
        return this.via(new ReferenceSpaceConversionNode(referenceSpace, true));
    }

    /**
     * Buffer pushed objects
     *
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public buffer(): this {
        return this.via(new MemoryBufferNode());
    }

    /**
     * Storage as sink node
     *
     * @returns {GraphBuilder} Graph builder
     */
    public store(): Builder {
        return this.to(new CallbackSinkNode());
    }

    public to(...nodes: Array<SinkNode<any> | string>): Builder {
        if (nodes.length !== 0) {
            const selectedNodes: Array<SinkNode<any>> = [];
            nodes.forEach((node) => {
                let nodeObject: Node<any, any>;
                if (typeof node === 'string') {
                    nodeObject = this.graph.findNodeByUID(node) || this.graph.findNodeByName(node);
                    if (nodeObject === undefined) {
                        // Add a placeholder
                        nodeObject = new PlaceholderNode(node);
                    }
                } else {
                    nodeObject = node;
                }

                this.graph.addNode(nodeObject);
                this._insertNode(nodeObject);
                this.graph.addEdge(new Edge(nodeObject, this.graph.internalOutput));
                selectedNodes.push(nodeObject as SinkNode<any>);
            });
            this.previousNodes = selectedNodes;
        } else {
            this._insertNode(this.graph.internalOutput);
        }
        return this.graphBuilder;
    }
}
