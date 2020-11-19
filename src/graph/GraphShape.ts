import { Node } from '../Node';
import { AbstractEdge } from './interfaces/AbstractEdge';
import { AbstractGraph } from './interfaces/AbstractGraph';
import { DataFrame } from '../data/DataFrame';
import { BroadcastNode } from '../nodes/shapes/BroadcastNode';
import { AbstractNode } from './interfaces';

export class GraphShape<In extends DataFrame, Out extends DataFrame>
    extends Node<In, Out>
    implements AbstractGraph<In, Out> {
    private _nodes: Map<string, Node<any, any>> = new Map();
    private _edges: Map<string, AbstractEdge<any>> = new Map();

    public internalInput: Node<any, In> = new BroadcastNode<In>();
    public internalOutput: Node<Out, any> = new BroadcastNode<Out>();

    constructor() {
        super();
        this.addNode(this.internalInput);
        this.addNode(this.internalOutput);

        this.once('build', this._onBuild.bind(this));
        this.once('destroy', this._onDestroy.bind(this));
    }

    private _onDestroy(): void {
        this.nodes.forEach((node) => {
            node.emit('destroy');
        });
    }

    private _onBuild(_: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const buildPromises: Array<Promise<boolean>> = [];
            this.nodes.forEach((node) => {
                buildPromises.push(node.emitAsync('build', _));
            });
            Promise.all(buildPromises)
                .then(() => {
                    this.emit('ready');
                    resolve();
                })
                .catch((ex) => {
                    reject(ex);
                });
        });
    }

    public get edges(): Array<AbstractEdge<any>> {
        return this._edges ? Array.from(this._edges.values()) : [];
    }

    public set edges(edges: Array<AbstractEdge<any>>) {
        edges.forEach(this.addEdge);
    }

    public get nodes(): Array<Node<any, any>> {
        return this._nodes ? Array.from(this._nodes.values()) : [];
    }

    public set nodes(nodes: Array<Node<any, any>>) {
        nodes.forEach(this.addNode);
    }

    public getNodeByUID(uid: string): Node<any, any> {
        return this._nodes.get(uid);
    }

    public getNodeByName(name: string): Node<any, any> {
        let result: Node<any, any>;
        this._nodes.forEach((node) => {
            if (node.name === name) {
                result = node;
                return;
            }
        });
        return result;
    }

    public addNode(node: AbstractNode<any, any>): void {
        (node as Node<any, any>).graph = this.graph === undefined ? this : this.graph;
        this._nodes.set(node.uid, node as Node<any, any>);
    }

    public addEdge(edge: AbstractEdge<any>): void {
        this._edges.set(edge.uid, edge);
    }

    public deleteEdge(edge: AbstractEdge<any>): void {
        this._edges.delete(edge.uid);
    }

    public deleteNode(node: AbstractNode<any, any>): void {
        this._nodes.delete(node.uid);
    }

    private _getNodeOutlets(node: Node<any, any>): Array<AbstractEdge<Out>> {
        return this.edges.filter((edge) => edge.inputNode === node);
    }

    private _getNodeInlets(node: Node<any, any>): Array<AbstractEdge<In>> {
        return this.edges.filter((edge) => edge.outputNode === node);
    }

    /**
     * Validate if the graph is connected
     */
    public validate(): void {
        this._validateNodes();
        this._validateEdges();
    }

    private _validateInternalNode(node: Node<any, any>): void {
        if (node.outputNodes.length === 0 && node.inputNodes.length === 0) {
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
     * Send a pull request to the graph
     *
     * @returns {Promise<void>} Pull promise
     */
    public pull(): Promise<void> {
        return this.internalOutput.pull();
    }

    public push(frame: In | In[]): Promise<void> {
        return this.internalInput.push(frame);
    }
}
