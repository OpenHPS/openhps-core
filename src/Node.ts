import 'reflect-metadata';
import * as uuidv4 from 'uuid/v4';
import { AbstractNode } from "./graph/interfaces/AbstractNode";
import { DataFrame } from "./data/DataFrame";
import { GraphPushOptions } from "./graph/GraphPushOptions";
import { GraphPullOptions } from "./graph/GraphPullOptions";
import { AbstractGraph } from "./graph/interfaces/AbstractGraph";
import { AbstractEdge } from './graph/interfaces/AbstractEdge';
import { jsonObject, jsonMember } from './data';

/**
 * OpenHPS model node.
 */
@jsonObject
export class Node<In extends DataFrame, Out extends DataFrame> implements AbstractNode<In, Out> {
    private _uid: string = uuidv4();
    private _name: string;
    private _graph: AbstractGraph<any, any>;
    private _events: Map<string, Array<(..._: any) => any>> = new Map();
    public logger: (level: string, log: any) => void = () => {};

    constructor() {
        this._events.set("push", new Array());
        this._events.set("pull", new Array());
        this._events.set("build", new Array());
        this._events.set("destroy", new Array());

        this._name = this.constructor.name;
        
        this.logger("debug", {
            node: this.uid,
            message: `Node has been constructed.`,
        });
    }

    @jsonMember
    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    @jsonMember
    public get graph(): AbstractGraph<any, any> {
        return this._graph;
    }

    public set graph(graph: AbstractGraph<any, any>) {
        this._graph = graph;
    }

    private _getOutlets(): Array<AbstractEdge<Out>> {
        const edges = new Array();
        this.graph.edges.forEach(edge => {
            if (edge.inputNode === this) {
                edges.push(edge);
            }
        });
        return edges;
    }

    private _getInlets(): Array<AbstractEdge<In>> {
        const edges = new Array();
        this.graph.edges.forEach(edge => {
            if (edge.outputNode === this) {
                edges.push(edge);
            }
        });
        return edges;
    }

    public get outputNodes(): Array<Node<any, any>> {
        const edges = this._getOutlets();
        const nodes = new Array();
        edges.forEach(edge => {
            nodes.push(edge.outputNode);
        });
        return nodes;
    }

    public get inputNodes(): Array<Node<any, any>> {
        const edges = this._getInlets();
        const nodes = new Array();
        edges.forEach(edge => {
            nodes.push(edge.inputNode);
        });
        return nodes;
    }
    
    /**
     * Get unique identifier of node
     */
    public get uid(): string {
        return this._uid;
    }

    /**
     * Set unique identifier of node
     * @param uid Unique identifier
     */
    public set uid(uid: string) {
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

            if (callbackPromises.length === 0) {
                const pullPromises = new Array();
                this.inputNodes.forEach(node => {
                    pullPromises.push(node.pull(options));
                });

                Promise.all(pullPromises).then(_ => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                Promise.all(callbackPromises).then(_ => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            }
        });
    }

    /**
     * Push data to the node
     * 
     * @param data Data frame to push
     * @param options 
     */
    public push(data: In, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (data === undefined || data === null) {
                this.logger("warning", {
                    node: this.uid,
                    message: `Node received null data frame!`,
                });
                return reject();
            }

            const callbackPromises = new Array();
            this._events.get('push').forEach(callback => {
                callbackPromises.push(callback(data, options));
            });

            if (callbackPromises.length === 0) {
                const pushPromises = new Array();
                this.outputNodes.forEach(node => {
                    pushPromises.push(node.push(data, options));
                });

                Promise.all(pushPromises).then(_ => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                Promise.all(callbackPromises).then(_ => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            }
        });
    }

    public on(event: 'push', callback: (data: In, options?: GraphPushOptions) => any): void;
    public on(event: 'pull', callback: (options?: GraphPullOptions) => any): void;
    public on(event: 'build', callback: (graphBuild: any) => any): void;
    public on(event: 'destroy', callback: () => any): void;
    public on(event: 'ready', callback: () => any): void;
    public on(event: 'eventregister', callback: () => any): void;
    /**
     * Register a new event
     * @param event Event name
     * @param callback Event callback
     */
    public on(event: string, callback: (_?: any) => any): void {
        if (this._events.has(event)) {
            const callbacks = this._events.get(event);
            callbacks.push(callback);
        } else {
            const callbacks = new Array();
            this._events.set(event, callbacks);
        }
        this.trigger('eventregister', { event, callback });
    }

    public trigger(event: 'destroy', _?: any): Promise<void>;
    public trigger(event: 'build', graphBuilder: any): Promise<void>;
    public trigger(event: 'ready', _?: any): Promise<void>;
    public trigger(event: 'eventregister', data: { event: string, callback: (_?: any) => any }): Promise<void>;
    public trigger(event: 'pull', options?: GraphPullOptions): Promise<void>;
    public trigger(event: 'push', data: In, options?: GraphPushOptions): Promise<void>;
    /**
     * Trigger an event
     * 
     * @param event Event name to trigger
     * @param _ Parameter for event 
     */
    public trigger(event: string, _?: any): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._events.has(event)) {
                const callbacks = this._events.get(event);
                const triggerPromises = new Array<Promise<any>>();
                callbacks.forEach(callback => {
                    triggerPromises.push(callback(_));
                });
                Promise.all(triggerPromises).then(function(values: any[]) {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                resolve();
            }
        });
    }

    public serialize(): Object {
        return {
            uid: this.uid,
            name: this.name
        };
    }

}
