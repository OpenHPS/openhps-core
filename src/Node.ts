import { v4 as uuidv4 } from 'uuid';
import { DataFrame } from './data/DataFrame';
import { AsyncEventEmitter } from './_internal/AsyncEventEmitter';
import { Edge, GraphBuilder, GraphShape, PullOptions, PushCompletedEvent, PushErrorEvent, PushOptions } from './graph';
import { Model } from './Model';

/**
 * The graph node has an input and output [[DataFrame]]
 *
 * ## Usage
 *
 */
export abstract class Node<In extends DataFrame, Out extends DataFrame> extends AsyncEventEmitter {
    /**
     * Unique identifier of node.
     */
    public uid: string = uuidv4();
    /**
     * Name of the node. Does not have to be unique.
     */
    public name: string;
    /**
     * Graph shape
     */
    public graph: GraphShape<any, any>;
    /**
     * Node options
     */
    protected options: NodeOptions;

    private _ready = false;
    private _available = true;

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
        this.on('error', this._onError.bind(this));
        this.on('completed', this._onCompleted.bind(this));
    }

    /**
     * Graph this model is part of
     *
     * @returns {Model} Positioning model
     */
    public get model(): Model<any, any> {
        return this.graph as Model;
    }

    public isReady(): boolean {
        return this._ready;
    }

    /**
     * Check if the node is available for accepting push requests
     *
     * @returns {boolean} Is the node available to push
     */
    public isAvailable(): boolean {
        return this._available;
    }

    /**
     * Graph logger
     *
     * @param {string} level Logging level
     * @param {any} log Message
     */
    public logger(level: string, log: any): void {
        this.model.logger(level, log);
    }

    /**
     * Get the outgoing edges
     *
     * @returns {Array<Edge<DataFrame>>} Outgoing edges
     */
    public get outlets(): Array<Edge<Out>> {
        return this.model.edges.filter((edge) => edge.inputNode === this);
    }

    /**
     * Get the incoming edges
     *
     * @returns {Array<Edge<DataFrame>>} Incoming edges
     */
    public get inlets(): Array<Edge<In>> {
        return this.model.edges.filter((edge) => edge.outputNode === this);
    }

    /**
     * Emit completed event
     *
     * @param {string} event completed
     */
    public emit(event: 'completed', e: PushCompletedEvent): boolean;
    /**
     * Emit error
     *
     * @param {string} event error
     */
    public emit(event: 'error', e: PushErrorEvent): boolean;
    /**
     * Node ready
     *
     * @param {string} event ready
     */
    public emit(event: 'ready'): boolean;
    /**
     * Destroy the node
     *
     * @param {string} event destroy
     */
    public emit(event: 'destroy'): boolean;
    public emit(event: string | symbol, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }

    /**
     * Event when a push is completed
     *
     * @param {string} event error
     * @param {Function} listener Event callback
     */
    public on(event: 'completed', listener: (event: PushCompletedEvent) => Promise<void> | void): this;
    /**
     * Event when an error is triggered
     *
     * @param {string} event error
     * @param {Function} listener Error event callback
     */
    public on(event: 'error', listener: (event: PushErrorEvent) => Promise<void> | void): this;
    /**
     * Event when a data frame is pulled
     *
     * @param {string} event receive
     * @param {Function} listener Event callback
     */
    public on(event: 'pull', listener: (options?: PullOptions) => Promise<void> | void): this;
    /**
     * Event when a data frame is push to the node
     *
     * @param {string} event receive
     * @param {Function} listener Event callback
     */
    public on(event: 'push', listener: (frame: In, options?: PushOptions) => Promise<void> | void): this;
    public on(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    /**
     * Event when a push is completed
     *
     * @param {string} event error
     * @param {Function} listener Event callback
     */
    public once(event: 'completed', listener: (event: PushCompletedEvent) => Promise<void> | void): this;
    /**
     * Event called when node is destroyed
     *
     * @param {string} event destroy
     * @param {Function} listener Event callback
     */
    public once(event: 'destroy', listener: () => void | Promise<void>): this;
    /**
     * Event called when node is build
     *
     * @param {string} event build
     * @param {Function} listener Event callback
     */
    public once(event: 'build', listener: (builder: GraphBuilder<DataFrame, DataFrame>) => void | Promise<void>): this;
    /**
     * Event called when node is ready
     *
     * @param {string} event ready
     * @param {Function} listener Event callback
     */
    public once(event: 'ready', listener: () => void | Promise<void>): this;
    public once(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.once(event, listener);
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
                this.inlets.forEach((inlet) => {
                    callbackPromises.push(inlet.pull(options));
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
     * @param {DataFrame | DataFrame[]} data Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    public push(data: In | In[], options: PushOptions = {}): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (data === null || data === undefined) {
                return reject(new Error('Node received null data frame!'));
            }

            const listeners = this.listeners('push');
            if (listeners.length === 0) {
                // Forward push, resolve before outlets resolve
                this.outlets.forEach((outlet) => outlet.push(data as any, options));
                resolve();
            } else {
                this._available = false;
                Promise.all(listeners.map((callback) => callback(data, options)))
                    .then(() => {
                        this._available = true;
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    private _onError(event: PushErrorEvent): void {
        this.inlets.map((inlet) => inlet.inputNode.emit('error', event));
    }

    private _onCompleted(event: PushCompletedEvent): void {
        this.inlets.map((inlet) => inlet.inputNode.emit('completed', event));
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
