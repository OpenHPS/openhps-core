import { Node } from "../../../Node";
import { AbstractEdge } from "../../interfaces/AbstractEdge";
import { AbstractGraph } from "../../interfaces/AbstractGraph";
import { DataFrame } from "../../../data/DataFrame";
import { ModelException } from "../../../exceptions";
import { GraphPushOptions } from "../../GraphPushOptions";
import { GraphPullOptions } from "../../GraphPullOptions";
import { BroadcastNode } from "../../../nodes/shapes/BroadcastNode";

export class GraphImpl<In extends DataFrame, Out extends DataFrame> extends Node<In, Out> implements AbstractGraph<In, Out> {
    private _nodes: Map<string, Node<any, any>> = new Map();
    private _edges: Map<string, AbstractEdge<any>> = new Map();
    
    private _flags: any = { ready: false };

    public internalInput: Node<any, In> = new BroadcastNode<In>();
    public internalOutput: Node<Out, any> = new BroadcastNode<Out>();

    constructor() {
        super();
        this.addNode(this.internalInput);
        this.addNode(this.internalOutput);

        this.on('build', this._onBuild.bind(this));
        this.on('destroy', this._onDestroy.bind(this));
        this.on('ready', this._onReady.bind(this));
        this.on('eventregister', this._onEventRegister.bind(this));
    }

    private _onReady(): void {
        this._flags.ready = true;
    }

    private _onDestroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            const destroyPromises = new Array();
            this.nodes.forEach(node => {
                destroyPromises.push(node.emit('destroy'));
            });
            Promise.all(destroyPromises).then(_2 => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _onEventRegister(event: { event: string, callback: () => void }): void {
        if (event.event === "ready" && this._flags.ready) {
            Promise.resolve(event.callback());
        }
    }

    private _onBuild(_: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const buildPromises = new Array();
            this.nodes.forEach(node => {
                buildPromises.push(node.emit('build', _));
            });
            Promise.all(buildPromises).then(_2 => {
                this.emit('ready');
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public get edges(): Array<AbstractEdge<any>> {
        if (this._edges === undefined) {
            return [];
        }
        return Array.from(this._edges.values());
    }

    public set edges(edges: Array<AbstractEdge<any>>) {
        edges.forEach(edge => {
            this.addEdge(edge);
        });
    }

    public get nodes(): Array<Node<any, any>> {
        if (this._nodes === undefined) {
            return [];
        }
        return Array.from(this._nodes.values());
    }

    public set nodes(nodes: Array<Node<any, any>>) {
        nodes.forEach(node => {
            this.addNode(node);
        });
    }

    public addNode(node: Node<any, any>): void {
        node.graph = this;
        this._nodes.set(node.uid, node);
    }

    public addEdge(edge: AbstractEdge<any>): void {
        this._edges.set(edge.uid, edge);
    }

    public deleteEdge(edge: AbstractEdge<any>): void {
        this._edges.delete(edge.uid);
    }

    public deleteNode(node: Node<any, any>): void {
        this._nodes.delete(node.uid);
    }

    private _getNodeOutlets(node: Node<any, any>): Array<AbstractEdge<Out>> {
        const edges = new Array();
        this.edges.forEach(edge => {
            if (edge.inputNode === node) {
                edges.push(edge);
            }
        });
        return edges;
    }

    private _getNodeInlets(node: Node<any, any>): Array<AbstractEdge<In>> {
        const edges = new Array();
        this.edges.forEach(edge => {
            if (edge.outputNode === node) {
                edges.push(edge);
            }
        });
        return edges;
    }

    public validate(): void {
        if (this.internalInput.outputNodes.length === 0) {
            this.deleteNode(this.internalInput);
        } else if (!this._nodes.has(this.internalInput.uid)) {
            throw new ModelException(`Internal input node ${this.internalInput.uid} is not added to the graph!`);
        }
        if (this.internalOutput.inputNodes.length === 0) {
            this.deleteNode(this.internalOutput);
        } else if (!this._nodes.has(this.internalInput.uid)) {
            throw new ModelException(`Internal output node ${this.internalOutput.uid} is not added to the graph!`);
        }

        this._nodes.forEach(node => {
            if (node.graph === undefined) {
                throw new ModelException(`Node ${node.uid} does not have a graph set!`);
            }
            if (this._getNodeInlets(node).length === 0 && this._getNodeOutlets(node).length === 0) {
                throw new ModelException(`Node ${node.uid} is not connected to the graph!`);
            }
        });
        this._edges.forEach(edge => {
            if (!this._nodes.has(edge.inputNode.uid)) {
                throw new ModelException(`Node ${edge.inputNode.uid} is used in an edge but not added to the graph!`);
            }
            if (!this._nodes.has(edge.outputNode.uid)) {
                throw new ModelException(`Node ${edge.outputNode.uid} is used in an edge but not added to the graph!`);
            }
        });
    }

    /**
     * Send a pull request to the graph
     * 
     * @param options Pull options
     */
    public pull(options?: GraphPullOptions): Promise<void> {
        return this.internalOutput.pull();
    }

    public push(data: In, options?: GraphPushOptions): Promise<void> {
        return this.internalInput.push(data, options);
    }

}
