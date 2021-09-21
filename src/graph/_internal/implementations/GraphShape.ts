import { GraphNode } from '../GraphNode';
import { DataFrame } from '../../../data/DataFrame';
import { BroadcastNode } from '../../../nodes/shapes/BroadcastNode';
import { PullOptions, PushOptions } from '../../options';
import { PushCompletedEvent, PushError } from '../../events';
import { Edge } from '../../Edge';
import { Graph } from '../../Graph';
import { Node } from '../../../Node';

/**
 * @category Graph
 */
export class GraphShape<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> implements Graph<In, Out> {
    private _nodes: Map<string, GraphNode<any, any>> = new Map();
    private _edges: Map<string, Edge<any>> = new Map();

    public internalSource: GraphNode<any, In> = new BroadcastNode<In>();
    public internalSink: GraphNode<Out, any> = new BroadcastNode<Out>();

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

    public get edges(): Array<Edge<any>> {
        return this._edges ? Array.from(this._edges.values()) : [];
    }

    public set edges(edges: Array<Edge<any>>) {
        edges.forEach(this.addEdge);
    }

    public get nodes(): Array<GraphNode<any, any>> {
        return this._nodes ? Array.from(this._nodes.values()) : [];
    }

    public set nodes(nodes: Array<GraphNode<any, any>>) {
        nodes.forEach(this.addNode);
    }

    public findNodeByUID(uid: string): GraphNode<any, any> {
        return this._nodes.get(uid);
    }

    public findNodeByName(name: string): GraphNode<any, any> {
        let result: GraphNode<any, any>;
        this._nodes.forEach((node) => {
            if (node.name === name) {
                result = node;
                return;
            }
        });
        return result;
    }

    public addNode(node: GraphNode<any, any>): void {
        node.graph = this.graph === undefined ? this : this.model;
        this._nodes.set(node.uid, node as Node<any, any>);
    }

    public addEdge(edge: Edge<any>): void {
        this._edges.set(edge.inputNode.uid + edge.outputNode.uid, edge);
    }

    public deleteEdge(edge: Edge<any>): void {
        this._edges.delete(edge.inputNode.uid + edge.outputNode.uid);
    }

    public deleteNode(node: GraphNode<any, any>): void {
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
     * @returns {(level: string, log: any) => void} logger function
     */
    public logger: (level: string, log: any) => void = () => undefined;

    /**
     * Send a pull request to the graph
     *
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    public pull(options?: PullOptions): Promise<void> {
        return this.internalSink.pull(options);
    }

    /**
     * Push data to the graph
     *
     * @param {DataFrame | DataFrame[]} frame Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    public push(frame: In | In[], options?: PushOptions): Promise<void> {
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
