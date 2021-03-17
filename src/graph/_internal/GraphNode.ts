import { v4 as uuidv4 } from 'uuid';
import { DataFrame } from '../../data';
import { AsyncEventEmitter } from '../../_internal/AsyncEventEmitter';
import { PushCompletedEvent, PushError, PushEvent } from '../events';
import { Inlet } from '../Inlet';
import { PullOptions, PushOptions } from '../options';
import { Outlet } from '../Outlet';

export abstract class GraphNode<In extends DataFrame, Out extends DataFrame>
    extends AsyncEventEmitter
    implements Inlet<Out>, Outlet<In> {
    /**
     * Name of the node. Does not have to be unique.
     */
    public name: string;
    /**
     * Unique identifier of node.
     */
    public uid: string = uuidv4();
    /**
     * Graph shape
     */
    public graph: any;
    private _ready = false;
    private _available = true;

    constructor() {
        super();
        this.prependOnceListener('ready', () => {
            this._ready = true;
        });
        this.on('error', this._onError.bind(this));
        this.on('completed', this._onCompleted.bind(this));
    }

    /**
     * Graph logger
     *
     * @param {string} level Logging level
     * @param {any} log Message
     */
    public logger(level: string, log: any): void {
        this.graph.logger(level, log);
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
     * Get the outgoing edges
     *
     * @returns {Array<Outlet<DataFrame>>} Outgoing edges
     */
    public get outlets(): Array<Outlet<Out>> {
        return this.graph.edges.filter((edge) => edge.inputNode === this);
    }

    /**
     * Get the incoming edges
     *
     * @returns {Array<Inlet<DataFrame>>} Incoming edges
     */
    public get inlets(): Array<Inlet<In>> {
        return this.graph.edges.filter((edge) => edge.outputNode === this);
    }

    public emit(name: string | symbol, ...args: any[]): boolean;
    /**
     * Emit available event
     *
     * @param {string} event available
     */
    public emit(event: 'available'): boolean;
    /**
     * Emit completed event
     *
     * @param {string} name completed
     */
    public emit(name: 'completed', e: PushCompletedEvent): boolean;
    /**
     * Emit error
     *
     * @param {string} name error
     */
    public emit(name: 'error', e: PushError): boolean;
    /**
     * Node ready
     *
     * @param {string} name ready
     */
    public emit(name: 'ready'): boolean;
    /**
     * Destroy the node
     *
     * @param {string} name destroy
     */
    public emit(name: 'destroy'): boolean;
    public emit(name: string | symbol, ...args: any[]): boolean {
        return super.emit(name, ...args);
    }

    public on(name: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Event when a node is available
     *
     * @param {string} event available
     * @param {Function} listener Event callback
     */
    public on(event: 'available', listener: () => Promise<void> | void): this;
    /**
     * Event when a push is completed
     *
     * @param {string} name error
     * @param {Function} listener Event callback
     */
    public on(name: 'completed', listener: (event: PushCompletedEvent) => Promise<void> | void): this;
    /**
     * Event when an error is triggered
     *
     * @param {string} name error
     * @param {Function} listener Error event callback
     */
    public on(name: 'error', listener: (event: PushError) => Promise<void> | void): this;
    /**
     * Event when a data frame is pulled
     *
     * @param {string} name receive
     * @param {Function} listener Event callback
     */
    public on(name: 'pull', listener: (options?: PullOptions) => Promise<void> | void): this;
    /**
     * Event when a data frame is push to the node
     *
     * @param {string} name receive
     * @param {Function} listener Event callback
     */
    public on(name: 'push', listener: (frame: In, options?: PushOptions) => Promise<void> | void): this;
    public on(name: string | symbol, listener: (...args: any[]) => void): this {
        return super.on(name, listener);
    }

    public once(name: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Event when a node is available
     *
     * @param {string} event available
     * @param {Function} listener Event callback
     */
    public once(event: 'available', listener: () => Promise<void> | void): this;
    /**
     * Event when a push is completed
     *
     * @param {string} name error
     * @param {Function} listener Event callback
     */
    public once(name: 'completed', listener: (event: PushCompletedEvent) => Promise<void> | void): this;
    /**
     * Event called when node is destroyed
     *
     * @param {string} name destroy
     * @param {Function} listener Event callback
     */
    public once(name: 'destroy', listener: () => void | Promise<void>): this;
    /**
     * Event called when node is build
     *
     * @param {string} name build
     * @param {Function} listener Event callback
     */
    public once(name: 'build', listener: (builder: any) => void | Promise<void>): this;
    /**
     * Event called when node is ready
     *
     * @param {string} name ready
     * @param {Function} listener Event callback
     */
    public once(name: 'ready', listener: () => void | Promise<void>): this;
    public once(name: string | symbol, listener: (...args: any[]) => void): this {
        return super.once(name, listener);
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
                        this.emit('available');
                        resolve();
                    })
                    .catch(reject);
            }
        });
    }

    /**
     * Promise once the node is available
     *
     * @returns {Promise} Promise when the node is available
     */
    public onceAvailable(): Promise<void> {
        return new Promise((resolve) => {
            if (this.isAvailable()) {
                resolve();
            } else {
                this.once('available', () => {
                    resolve();
                });
            }
        });
    }

    /**
     * Promise once the frame is completed
     *
     * @param {string} frameUID Frame UID
     * @returns {Promise} Promise when the frame is completed
     */
    public onceCompleted(frameUID: string): Promise<PushEvent> {
        return new Promise((resolve, reject) => {
            const completedListener = function (event: PushEvent) {
                if (event.frameUID === frameUID) {
                    this.removeListener('completed', completedListener);
                    this.removeListener('error', completedListener);
                    if ((event as any).error) {
                        reject(event);
                    } else {
                        resolve(event);
                    }
                }
            };
            this.on('completed', completedListener.bind(this));
            this.on('error', completedListener.bind(this));
        });
    }

    private _onError(error: PushError): void {
        this.inlets.forEach((inlet) => inlet.emit('error', error));
    }

    private _onCompleted(event: PushCompletedEvent): void {
        this.inlets.forEach((inlet) => inlet.emit('completed', event));
    }
}
