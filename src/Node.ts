import { v4 as uuidv4 } from 'uuid';
import { AbstractNode } from './graph/interfaces/AbstractNode';
import { DataFrame } from './data/DataFrame';
import { AbstractGraph } from './graph/interfaces/AbstractGraph';
import { AbstractEdge } from './graph/interfaces/AbstractEdge';
import { AsyncEventEmitter } from './_internal/AsyncEventEmitter';
import { PullOptions, PushOptions } from './graph';

/**
 * The graph node has an input and output [[DataFrame]]
 *
 * ## Usage
 *
 */
export abstract class Node<In extends DataFrame, Out extends DataFrame>
    extends AsyncEventEmitter
    implements AbstractNode<In, Out> {
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
     *
     * @returns {Function} Logger function
     */
    public logger: (level: string, log: any) => void = () => true;

    private _ready = false;

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
        return this.graph.edges.filter((edge) => edge.inputNode === this);
    }

    protected get inlets(): Array<AbstractEdge<In>> {
        return this.graph.edges.filter((edge) => edge.outputNode === this);
    }

    public get outputNodes(): Array<Node<DataFrame, DataFrame>> {
        return this.outlets.map((edge) => edge.outputNode) as Array<Node<DataFrame, DataFrame>>;
    }

    public get inputNodes(): Array<Node<DataFrame, DataFrame>> {
        return this.inlets.map((edge) => edge.inputNode) as Array<Node<DataFrame, DataFrame>>;
    }

    /**
     * Send a pull request to the node
     *
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    public pull(options?: PullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const callbackPromises: Array<Promise<void>> = [];
            this.listeners('pull').forEach((callback) => {
                callbackPromises.push(callback(options));
            });

            if (callbackPromises.length === 0) {
                this.inputNodes.forEach((node) => {
                    callbackPromises.push(node.pull(options));
                });
            }

            Promise.all(callbackPromises)
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Push data to the node
     *
     * @param {DataFrame | DataFrame[]} frame Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    public push(frame: In | In[], options: PushOptions = {}): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (frame === null || frame === undefined) {
                this.logger('warning', {
                    node: { uid: this.uid, name: this.name },
                    message: `Node received null data frame!`,
                });
                return reject();
            }

            const newOptions: PushOptions = {
                ...options,
                pushNode: this.uid,
            };

            const callbackPromises: Array<Promise<void>> = [];
            this.listeners('push').forEach((callback) => {
                callbackPromises.push(callback(frame, newOptions));
            });

            if (callbackPromises.length === 0) {
                this.outputNodes.forEach((node) => {
                    callbackPromises.push(node.push(frame, newOptions));
                });
            }

            Promise.all(callbackPromises)
                .then(() => {
                    resolve();
                })
                .catch(reject);
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
