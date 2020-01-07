import * as uuidv4 from 'uuid/v4';
import { AbstractNode } from "./graph/interfaces/AbstractNode";
import { DataFrame } from "./data/DataFrame";
import { GraphPushOptions, GraphPullOptions } from "./utils";
import { AbstractGraph } from "./graph/interfaces/AbstractGraph";
import { AbstractEdge } from './graph/interfaces/AbstractEdge';

export class Node<In extends DataFrame, Out extends DataFrame> implements AbstractNode<In, Out> {
    private _uid: string = uuidv4();
    private _name: string;
    private _graph: AbstractGraph<any, any>;
    private _events: Map<string, Array<(..._: any) => any>> = new Map();
    private _logger: (level: string, log: any) => void = () => {};

    constructor() {
        this._events.set("push", new Array());
        this._events.set("pull", new Array());
        this._events.set("build", new Array());

        this._name = this.constructor.name;

        this.getLogger()("debug", {
            node: this.getUID(),
            message: `Node has been constructed.`,
        });
    }

    public getName(): string {
        return this._name;
    }

    public setName(name: string): void {
        this._name = name;
    }

    public getGraph(): AbstractGraph<any, any> {
        return this._graph;
    }

    public setGraph(graph: AbstractGraph<any, any>): void {
        this._graph = graph;
    }

    private _getOutlets(): Array<AbstractEdge<Out>> {
        const edges = new Array();
        this.getGraph().getEdges().forEach(edge => {
            if (edge.getInputNode() === this) {
                edges.push(edge);
            }
        });
        return edges;
    }

    private _getInlets(): Array<AbstractEdge<In>> {
        const edges = new Array();
        this.getGraph().getEdges().forEach(edge => {
            if (edge.getOutputNode() === this) {
                edges.push(edge);
            }
        });
        return edges;
    }

    public getOutputNodes(): Array<Node<any, any>> {
        const edges = this._getOutlets();
        const nodes = new Array();
        edges.forEach(edge => {
            nodes.push(edge.getOutputNode());
        });
        return nodes;
    }

    public getInputNodes(): Array<Node<any, any>> {
        const edges = this._getInlets();
        const nodes = new Array();
        edges.forEach(edge => {
            nodes.push(edge.getInputNode());
        });
        return nodes;
    }

    /**
     * Get logger
     */
    public getLogger(): (level: string, log: any) => void {
        return this._logger;
    }

    /**
     * Set logger
     */
    public setLogger(logger: (level: string, log: any) => void): void {
        this._logger = logger;
    }
    
    /**
     * Get unique identifier of node
     */
    public getUID(): string {
        return this._uid;
    }

    /**
     * Set unique identifier of node
     * @param uid Unique identifier
     */
    public setUID(uid: string): void {
        this._uid = uid;
    }

    /**
     * Send a pull request to the node
     * 
     * @param options Pull options
     */
    public pull(options?: GraphPullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const callbackPromises = new Array();
            this._events.get('pull').forEach(callback => {
                callbackPromises.push(callback(options));
            });
            Promise.resolve(callbackPromises).then(_ => {
                resolve();
            });
            if (callbackPromises.length === 0) {
                const pullPromises = new Array();
                this.getInputNodes().forEach(node => {
                    pullPromises.push(node.pull(options));
                });
                Promise.resolve(pullPromises).then(_ => {
                    resolve();
                });
            }
        });
    }

    public push(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (data === undefined || data === null) {
                this.getLogger()("warning", {
                    node: this.getUID(),
                    message: `Node received null data frame!`,
                });
                return reject();
            }

            const callbackPromises = new Array();
            this._events.get('push').forEach(callback => {
                callbackPromises.push(callback(data, options));
            });
            Promise.resolve(callbackPromises).then(_ => {
                resolve();
            });
            if (callbackPromises.length === 0) {
                resolve();
            }
        });
    }

    public on(event: string, callback: () => any): void {
        if (this._events.has(event)) {
            const callbacks = this._events.get(event);
            callbacks.push(callback);
        } else {
            const callbacks = new Array();
            this._events.set(event, callbacks);
        }
    }

    public trigger(event: string, ..._: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._events.has(event)) {
                const callbacks = this._events.get(event);
                const promises = new Array();
                callbacks.forEach(callback => {
                    promises.push(callback(_));
                });
                Promise.resolve(callbacks).then(function(values: any[]) {
                    resolve();
                });
                if (promises.length === 0) {
                    resolve();
                }
            }
            resolve();
        });
    }

    public serialize(): Object {
        return {
            uid: this._uid,
            name: this.getName()
        };
    }

}
