import { DataFrame, DataObject, ReferenceSpace } from '../../data';
import { GraphNode } from '../_internal/GraphNode';
import { TimeUnit } from '../../utils';
import { GraphShape } from '../_internal/implementations/GraphShape';
import { PlaceholderNode } from '../../nodes/_internal/PlaceholderNode';
import { SinkNode } from '../../nodes/SinkNode';
import { SourceNode } from '../../nodes/SourceNode';
import { Edge } from '../Edge';
import { Graph } from '../Graph';

/**
 * Graph builder
 *
 * @category Graph
 */
export class GraphBuilder<In extends DataFrame, Out extends DataFrame> {
    public graph: GraphShape<In, Out>;

    protected constructor(graph: GraphShape<In, Out> = new GraphShape()) {
        this.graph = graph;
        this.graph.name = 'graph';
    }

    public static create<In extends DataFrame, Out extends DataFrame>(): GraphBuilder<In, Out> {
        return new GraphBuilder();
    }

    /**
     * Event when graph is ready
     *
     * @param {string} name ready
     * @param {Function} listener Event callback
     */
    public on(name: 'ready', listener: () => Promise<void> | void): this;
    /**
     * Event before building the graph
     *
     * @param {string} name prebuild
     * @param {Function} listener Event callback
     */
    public on(name: 'prebuild', listener: () => Promise<void> | void): this;
    /**
     * Event after building the graph
     *
     * @param {string} name postbuild
     * @param {Function} listener Event callback
     */
    public on(name: 'postbuild', listener: (model: GraphShape<any, any>) => Promise<void> | void): this;
    public on(name: string | symbol, listener: (...args: any[]) => void): this {
        this.graph.once(name, listener);
        return this;
    }

    public from(...nodes: Array<GraphNode<any, any> | string>): GraphShapeBuilder<any> {
        const selectedNodes: Array<GraphNode<any, any>> = [];
        nodes.forEach((node: GraphNode<any, any> | string) => {
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
                    this.graph.addEdge(new Edge(this.graph.internalSource, node));
                }
                selectedNodes.push(node);
            }
        });
        return new GraphShapeBuilder(
            this,
            this.graph,
            selectedNodes.length === 0 ? [this.graph.internalSource] : selectedNodes,
        );
    }

    public addNode(node: GraphNode<any, any>): this {
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

    public deleteNode(node: GraphNode<any, any>): this {
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
        this.graph.addEdge(new Edge(this.graph.internalSource, graph.internalSource));
        this.graph.addEdge(new Edge(graph.internalSink, this.graph.internalSink));
        return this;
    }

    public build(): Promise<Graph<In, Out>> {
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
    protected previousNodes: Array<GraphNode<any, any>>;
    protected graph: GraphShape<any, any>;
    protected static shapes: Map<string, (...args: any[]) => GraphNode<any, any>> = new Map();

    constructor(graphBuilder: Builder, graph: GraphShape<any, any>, nodes: Array<GraphNode<any, any>>) {
        this.graphBuilder = graphBuilder;
        this.previousNodes = nodes;
        this.graph = graph;
    }

    protected viaGraph(graph: GraphShape<any, any>): this {
        // Add graph as node
        graph.nodes.forEach((node) => {
            node.graph = this.graph;
            this.graph.addNode(node);
        });
        graph.edges.forEach((edge) => {
            this.graph.addEdge(edge);
        });
        this._insertNode(graph.internalSource);
        this.previousNodes = [graph.internalSink];
        return this;
    }

    public via(...nodes: Array<GraphNode<any, any> | string | GraphShape<any, any> | GraphBuilder<any, any>>): this {
        const selectedNodes: Array<GraphNode<any, any>> = [];
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node instanceof GraphBuilder) {
                return this.viaGraph(node.graph);
            } else if (node instanceof GraphShape) {
                return this.viaGraph(node);
            } else {
                let nodeObject: GraphNode<any, any>;
                if (typeof node === 'string') {
                    nodeObject = this.graph.findNodeByUID(node) || this.graph.findNodeByName(node);
                    if (nodeObject === undefined) {
                        // Add a placeholder
                        nodeObject = new PlaceholderNode(node);
                    }
                } else {
                    nodeObject = node as GraphNode<any, any>;
                }

                this.graph.addNode(nodeObject);
                this._insertNode(nodeObject);
                selectedNodes.push(nodeObject);
            }
        }
        this.previousNodes = selectedNodes;
        return this;
    }

    /**
     * Insert a new node in the existing graph
     *
     * @param {Node} node Node to insert
     */
    private _insertNode(node: GraphNode<any, any>): void {
        this.previousNodes.forEach((prevNode) => {
            this.graph.addEdge(new Edge(prevNode, node));
        });
    }

    public static registerShape(key: string, fn: (...args: any[]) => GraphNode<any, any>): void {
        GraphShapeBuilder.shapes.set(key, fn);
    }

    public chunk(size: number, timeout?: number, timeoutUnit?: TimeUnit): this {
        return this.via(GraphShapeBuilder.shapes.get('chunk')(size, timeout, timeoutUnit));
    }

    public flatten(): this {
        return this.via(GraphShapeBuilder.shapes.get('flatten')());
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
        return this.via(GraphShapeBuilder.shapes.get('filter')(filterFn));
    }

    /**
     * Filter objects inside frames
     *
     * @param {Function} filterFn Filter function (true to keep, false to remove)
     * @returns {GraphShapeBuilder} Current graph builder instance
     */
    public filterObjects(filterFn: (object: DataObject, frame?: DataFrame) => boolean): this {
        return this.via(GraphShapeBuilder.shapes.get('filterObjects')(filterFn));
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
        return this.via(GraphShapeBuilder.shapes.get('merge')(by, timeout, timeoutUnit));
    }

    public debounce(timeout = 100, timeoutUnit = TimeUnit.MILLISECOND): this {
        return this.via(GraphShapeBuilder.shapes.get('debounce')(timeout, timeoutUnit));
    }

    /**
     * Clone frames
     *
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public clone(): this {
        return this.via(GraphShapeBuilder.shapes.get('clone')());
    }

    /**
     * Convert positions of all objects to a certain reference space
     *
     * @param {ReferenceSpace | string} referenceSpace Reference space to convert to
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public convertToSpace(referenceSpace: ReferenceSpace | string): this {
        return this.via(GraphShapeBuilder.shapes.get('convertToSpace')(referenceSpace));
    }

    /**
     * Convert positions of all objects from a certain reference space
     *
     * @param {ReferenceSpace | string} referenceSpace Reference space to convert from
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public convertFromSpace(referenceSpace: ReferenceSpace | string): this {
        return this.via(GraphShapeBuilder.shapes.get('convertFromSpace')(referenceSpace));
    }

    /**
     * Buffer pushed objects
     *
     * @returns {GraphShapeBuilder} Current graph shape builder
     */
    public buffer(): this {
        return this.via(GraphShapeBuilder.shapes.get('buffer')());
    }

    /**
     * Storage as sink node
     *
     * @returns {GraphBuilder} Graph builder
     */
    public store(): Builder {
        return this.to(GraphShapeBuilder.shapes.get('store')() as SinkNode);
    }

    public to(...nodes: Array<SinkNode<any> | string>): Builder {
        if (nodes.length !== 0) {
            const selectedNodes: Array<SinkNode<any>> = [];
            nodes.forEach((node) => {
                let nodeObject: GraphNode<any, any>;
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
                this.graph.addEdge(new Edge(nodeObject, this.graph.internalSink));
                selectedNodes.push(nodeObject as SinkNode<any>);
            });
            this.previousNodes = selectedNodes;
        } else {
            this._insertNode(this.graph.internalSink);
        }
        return this.graphBuilder;
    }
}
