import { v4 as uuidv4 } from 'uuid';
import { AbstractNode } from "./graph/interfaces/AbstractNode";
import { DataFrame } from "./data/DataFrame";
import { AbstractGraph } from "./graph/interfaces/AbstractGraph";
import { AbstractEdge } from './graph/interfaces/AbstractEdge';
import { AsyncEventEmitter } from './_internal/AsyncEventEmitter';

/**
 * The graph node has an input and output [[DataFrame]]
 * 
 * ## Usage
 * 
 */
export abstract class Node<In extends DataFrame, Out extends DataFrame> extends AsyncEventEmitter implements AbstractNode<In, Out> {
    /**
     * Unique identifier of node.
     */
    public uid: string = uuidv4();
    /**
     * Name of the node. Does not have to be unique.
     */
    public name: string;
    /**
     * Graph this model is part of
     */
    public graph: AbstractGraph<any, any>;
    /**
     * Node options
     */
    protected options: NodeOptions;
    /**
     * Node logger
     */
    public logger: (level: string, log: any) => void = () => {};

    private _ready: boolean = false;

    constructor(options?: NodeOptions) {
        super();
        this.options = options || {};

        // Set the display name of the node to the type name
        this.name = this.options.name || this.constructor.name;
        // Set the uid of the node if manually set
        this.uid = this.options.uid || this.uid;

        this.prependOnceListener('ready', () => {
            this._ready = true;
        });
    }

    public isReady(): boolean {
        return this._ready;
    }

    protected get outlets(): Array<AbstractEdge<Out>> {
        return this.graph.edges.filter(edge => edge.inputNode === this);
    }

    protected get inlets(): Array<AbstractEdge<In>> {
        return this.graph.edges.filter(edge => edge.outputNode === this);
    }

    public get outputNodes(): Array<Node<any, any>> {
        return this.outlets.map(edge => edge.outputNode) as Array<Node<any, any>>;
    }

    public get inputNodes(): Array<Node<any, any>> {
        return this.inlets.map(edge => edge.inputNode) as Array<Node<any, any>>;
    }

    /**
     * Send a pull request to the node
     * 
     * @param options Pull options
     */
    public pull(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const callbackPromises = new Array();
            this.listeners('pull').forEach(callback => {
                callbackPromises.push(callback());
            });

            if (callbackPromises.length === 0) {
                this.inputNodes.forEach(node => {
                    callbackPromises.push(node.pull());
                });
            }

            Promise.all(callbackPromises).then(() => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Push data to the node
     * 
     * @param frame Data frame to push
     */
    public push(frame: In | In[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (frame === null || frame === undefined) {
                this.logger("warning", {
                    node: { uid: this.uid, name: this.name },
                    message: `Node received null data frame!`,
                });
                return reject();
            }

            const callbackPromises = new Array();
            this.listeners('push').forEach(callback => {
                callbackPromises.push(callback(frame));
            });

            if (callbackPromises.length === 0) {
                this.outputNodes.forEach(node => {
                    callbackPromises.push(node.push(frame));
                });
            }

            Promise.all(callbackPromises).then(() => {
                resolve();
            }).catch(reject);
        });
    }

}

export interface NodeOptions {
    /**
     * Manually set the unique identifier of the node
     */
    uid?: string;
    /**
     * User friendly name of the node
     *  Used for querying a node by its name.
     */
    name?: string;
}
