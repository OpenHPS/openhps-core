import { GraphNode } from '../GraphNode';
import { DataFrame } from '../../../data/DataFrame';
import { BroadcastNode } from '../../../nodes/shapes/BroadcastNode';
import { PullOptions, PushOptions } from '../../options';
import { PushCompletedEvent, PushError } from '../../events';
import { Edge } from '../../Edge';
import { Graph } from '../../Graph';
import { Node } from '../../../Node';
import { Constructor, SerializableMapMember, SerializableMember, SerializableObject } from '../../../data/decorators';
import { DataSerializer } from '../../../data';

/**
 * @category Graph
 */
@SerializableObject({
    initializer: (sourceObject: any, raw: any) => {
        const expectedType = DataSerializer.findTypeByName(raw.__type);
        const targetObject = new (expectedType as Constructor<any>)();
        Object.assign(targetObject, sourceObject);
        raw.edges.forEach((edge: any) => {
            targetObject._edges.set(
                edge.input + edge.output,
                new Edge(sourceObject._nodes.get(edge.input), sourceObject._nodes.get(edge.output)),
            );
        });
        return targetObject;
    },
})
export class GraphShape<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> implements Graph<In, Out> {
    @SerializableMapMember(String, GraphNode, {
        name: 'nodes',
    })
    private _nodes: Map<string, GraphNode<any, any>> = new Map();
    @SerializableMapMember(String, Edge, {
        serializer: (edges: Map<string, Edge<any>>) => {
            return Array.from(edges.values()).map((edge: Edge<any>) => ({
                input: edge.inputNode.uid,
                output: edge.outputNode.uid,
            }));
        },
        name: 'edges',
    })
    private _edges: Map<string, Edge<any>> = new Map();

    @SerializableMember({
        serializer: (node) => node.uid,
        deserializer: () => {
            return undefined;
        },
    })
    internalSource: GraphNode<any, In> = new BroadcastNode<In>();
    @SerializableMember({
        serializer: (node) => node.uid,
        deserializer: () => {
            return undefined;
        },
    })
    internalSink: GraphNode<Out, any> = new BroadcastNode<Out>();

    constructor() {
        super();
        // Internal input and output nodes
        this.addNode(this.internalSource);
        this.addNode(this.internalSink);

        // Graph building and destroying
        this.once('build', this._onBuild.bind(this));
        this.once('destroy', this._onDestroy.bind(this));
        // Error handling
        this.removeAllListeners('error');
        this.internalSource.on('error', this.onError.bind(this));
        this.internalSink.on('error', this.onError.bind(this));
        // Completed event
        this.removeAllListeners('completed');
        this.internalSource.on('completed', this.onCompleted.bind(this));
        this.internalSink.on('completed', this.onCompleted.bind(this));
    }

    private _onDestroy(): void {
        this.nodes.forEach((node) => {
            node.emit('destroy');
        });
    }

    private _onBuild(_: any): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all(this.nodes.map((node) => node.emitAsync('build', _)))
                .then(() => {
                    this.emit('ready');
                    resolve();
                })
                .catch((ex) => {
                    reject(ex);
                });
        });
    }

    get edges(): Array<Edge<any>> {
        return this._edges ? Array.from(this._edges.values()) : [];
    }

    set edges(edges: Array<Edge<any>>) {
        edges.forEach(this.addEdge);
    }

    get nodes(): Array<GraphNode<any, any>> {
        return this._nodes ? Array.from(this._nodes.values()) : [];
    }

    set nodes(nodes: Array<GraphNode<any, any>>) {
        nodes.forEach(this.addNode);
    }

    findNodeByUID(uid: string): GraphNode<any, any> {
        return this._nodes.get(uid);
    }

    findNodeByName(name: string): GraphNode<any, any> {
        let result: GraphNode<any, any>;
        this._nodes.forEach((node) => {
            if (node.name === name) {
                result = node;
                return;
            }
        });
        return result;
    }

    addNode(node: GraphNode<any, any>): void {
        node.graph = this.graph === undefined ? this : this.model;
        this._nodes.set(node.uid, node as Node<any, any>);
    }

    addEdge(edge: Edge<any>): void {
        this._edges.set(edge.inputNode.uid + edge.outputNode.uid, edge);
    }

    deleteEdge(edge: Edge<any>): void {
        this._edges.delete(edge.inputNode.uid + edge.outputNode.uid);
    }

    deleteNode(node: GraphNode<any, any>): void {
        this._nodes.delete(node.uid);
    }

    /**
     * Find an edge by the identifiers of its inlet and outlet
     *
     * @param {string} inlet Node uid of inlet
     * @param {string} outlet Node uid of outlet
     * @returns {Edge<any>} Edge
     */
    findEdge(inlet: string, outlet: string): Edge<any> {
        return this._edges.get(inlet + outlet);
    }

    /**
     * Graph logger
     *
     * @returns {(level: string, message: string, data?: any) => void} logger function
     */
    logger: (level: string, message: string, data?: any) => void = () => undefined;

    /**
     * Send a pull request to the graph
     *
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    pull(options?: PullOptions): Promise<void> {
        return this.internalSink.pull(options);
    }

    /**
     * Push data to the graph
     *
     * @param {DataFrame | DataFrame[]} frame Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    push(frame: In | In[], options?: PushOptions): Promise<void> {
        return this.internalSource.push(frame, options);
    }

    protected onError(event: PushError): void {
        // Do not emit if no listeners attached
        // Event emitter will throw an uncaught exception
        if (this.listenerCount('error') > 0) this.emit('error', event);
    }

    protected onCompleted(event: PushCompletedEvent): void {
        this.emit('completed', event);
    }
}
