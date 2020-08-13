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
    private _uid: string = uuidv4();
    private _name: string;
    private _graph: AbstractGraph<any, any>;
    private _ready: boolean = false;
    private _options: NodeOptions;
    public logger: (level: string, log: any) => void = () => {};

    constructor(options?: NodeOptions) {
        super();
        this._options = options || {};

        // Set the display name of the node to the type name
        this._name = this._options.name || this.constructor.name;

        this.prependOnceListener('ready', () => {
            this._ready = true;
        });
    }

    public get options(): NodeOptions {
        return this._options;
    }

    public isReady(): boolean {
        return this._ready;
    }

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get graph(): AbstractGraph<any, any> {
        return this._graph;
    }

    public set graph(graph: AbstractGraph<any, any>) {
        this._graph = graph;
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
            }).catch(ex => {
                reject(ex);
            });
        });
    }

}

export interface NodeOptions {
    /**
     * User friendly name of the node
     *  Used for querying a node by its name.
     */
    name?: string;
}
