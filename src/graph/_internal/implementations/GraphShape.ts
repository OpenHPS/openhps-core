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

    public internalInput: GraphNode<any, In> = new BroadcastNode<In>();
    public internalOutput: GraphNode<Out, any> = new BroadcastNode<Out>();

    constructor() {
        super();
        // Internal input and output nodes
        this.addNode(this.internalInput);
        this.addNode(this.internalOutput);

        // Graph building and destroying
        this.once('build', this._onBuild.bind(this));
        this.once('destroy', this._onDestroy.bind(this));
        // Error handling
        this.removeAllListeners('error');
        this.internalInput.on('error', this.onError.bind(this));
        this.internalOutput.on('error', this.onError.bind(this));
        // Completed event
        this.removeAllListeners('completed');
        this.internalInput.on('completed', this.onCompleted.bind(this));
        this.internalOutput.on('completed', this.onCompleted.bind(this));
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

    private _getNodeOutlets(node: GraphNode<any, any>): Array<Edge<Out>> {
        return this.edges.filter((edge) => edge.inputNode === node);
    }

    private _getNodeInlets(node: GraphNode<any, any>): Array<Edge<In>> {
        return this.edges.filter((edge) => edge.outputNode === node);
    }

    /**
     * Validate if the graph is connected
     */
    public validate(): void {
        this._validateNodes();
        this._validateEdges();
    }

    private _validateInternalNode(node: GraphNode<any, any>): void {
        if (node.outlets.length === 0 && node.inlets.length === 0) {
            this.deleteNode(node);
        } else if (!this._nodes.has(node.uid)) {
            throw new Error(`Internal node ${node.uid} (${node.name}) is not connected to the graph!`);
        }
    }

    private _validateNodes(): void {
        this._validateInternalNode(this.internalInput);
        this._validateInternalNode(this.internalOutput);

        this._nodes.forEach((node) => {
            if (node.graph === undefined) {
                throw new Error(`Node ${node.uid} (${node.name}) does not have a graph set!`);
            }
            if (this._getNodeInlets(node).length === 0 && this._getNodeOutlets(node).length === 0) {
                throw new Error(`Node ${node.uid} (${node.name}) is not connected to the graph!`);
            }
        });
    }

    private _validateEdges(): void {
        this._edges.forEach((edge) => {
            if (!this._nodes.has(edge.inputNode.uid)) {
                throw new Error(
                    `Node ${edge.inputNode.uid} (${edge.inputNode.name}) is used in an edge but not added to the graph!`,
                );
            } else if (!this._nodes.has(edge.outputNode.uid)) {
                throw new Error(
                    `Node ${edge.outputNode.uid} (${edge.outputNode.name}) is used in an edge but not added to the graph!`,
                );
            }
        });
    }

    /**
     * Graph logger
     *
     * @param {string} level Logging level
     * @param {any} log Message
     */
    // eslint-disable-next-line
    public logger(level: string, log: any): void {
        return;
    }

    /**
     * Send a pull request to the graph
     *
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    public pull(options?: PullOptions): Promise<void> {
        return this.internalOutput.pull(options);
    }

    /**
     * Push data to the graph
     *
     * @param {DataFrame | DataFrame[]} frame Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    public push(frame: In | In[], options?: PushOptions): Promise<void> {
        return this.internalInput.push(frame, options);
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
