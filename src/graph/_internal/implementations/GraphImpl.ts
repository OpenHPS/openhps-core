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
    
    public internalInput: Node<any, In> = new BroadcastNode<In>();
    public internalOutput: Node<Out, any> = new BroadcastNode<Out>();

    constructor() {
        super();
        this.addNode(this.internalInput);
        this.addNode(this.internalOutput);

        this.on('build', this._onBuild);
    }

    private _onBuild() {
        this.getNodes().forEach(node => {
            node.trigger('build'); 
        });
    }

    public getEdges(): Array<AbstractEdge<any>> {
        return Array.from(this._edges.values());
    }

    public getNodes(): Array<Node<any, any>> {
        return Array.from(this._nodes.values());
    }

    public addNode(node: Node<any, any>): void {
        node.setGraph(this);
        this._nodes.set(node.getUID(), node);
    }

    public addEdge(edge: AbstractEdge<any>): void {
        this._edges.set(edge.getUID(), edge);
    }

    public deleteEdge(edge: AbstractEdge<any>): void {
        this._edges.delete(edge.getUID());
    }

    public deleteNode(node: Node<any, any>): void {
        this._nodes.delete(node.getUID());
    }

    private _getNodeOutlets(node: Node<any, any>): Array<AbstractEdge<Out>> {
        const edges = new Array();
        this.getEdges().forEach(edge => {
            if (edge.getInputNode() === node) {
                edges.push(edge);
            }
        });
        return edges;
    }

    private _getNodeInlets(node: Node<any, any>): Array<AbstractEdge<In>> {
        const edges = new Array();
        this.getEdges().forEach(edge => {
            if (edge.getOutputNode() === node) {
                edges.push(edge);
            }
        });
        return edges;
    }

    public validate(): void {
        this._nodes.forEach(node => {
            if (node.getGraph() === undefined) {
                throw new ModelException(`Node ${node.getUID()} does not have a graph set!`);
            }
            if (this._getNodeInlets(node).length === 0 && this._getNodeOutlets(node).length === 0) {
                throw new ModelException(`Node ${node.getUID()} is not connected to the graph!`);
            }
        });
        this._edges.forEach(edge => {
            if (!this._nodes.has(edge.getInputNode().getUID())) {
                throw new ModelException(`Node ${edge.getInputNode().getUID()} is used in an edge but not added to the graph!`);
            }
            if (!this._nodes.has(edge.getOutputNode().getUID())) {
                throw new ModelException(`Node ${edge.getOutputNode().getUID()} is used in an edge but not added to the graph!`);
            }
        });
        if (!this._nodes.has(this.internalInput.getUID())) {
            throw new ModelException(`Internal input node ${this.internalInput.getUID()} is not added to the graph!`);
        }
        if (!this._nodes.has(this.internalOutput.getUID())) {
            throw new ModelException(`Internal output node ${this.internalOutput.getUID()} is not added to the graph!`);
        }
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

    public serialize(): Object {
        const nodesSerialized = Array();
        const edgesSerialized = Array();
        this.getNodes().forEach(node => {
            nodesSerialized.push(node.serialize());
        });
        this.getEdges().forEach(edge => {
            edgesSerialized.push(edge.serialize());
        });
        return {
            uid: this.getUID(),
            name: this.getName(),
            nodes: nodesSerialized,
            edges: edgesSerialized
        };
    }
}
