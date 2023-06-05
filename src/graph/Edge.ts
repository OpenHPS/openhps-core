import { PullOptions, PushOptions } from './options';
import { DataFrame } from '../data';
import { GraphNode } from './_internal/GraphNode';
import { PushCompletedEvent, PushError } from './events';
import { Inlet } from './Inlet';
import { Outlet } from './Outlet';
import { EventEmitter } from 'events';

/**
 * Edge provides the connection between two nodes
 * Nodes have access to inlet and outlet interfaces that only
 * allow functionality needed for the type of port.
 *
 * As a part of the graph that can not be modified, this object
 * has the ability to perform error handling.
 * @category Graph
 */
export class Edge<InOut extends DataFrame> extends EventEmitter implements Inlet<InOut>, Outlet<InOut> {
    inputNode: GraphNode<any, InOut>;
    outputNode: GraphNode<InOut, any>;

    constructor(inputNode: GraphNode<any, InOut>, outputNode: GraphNode<InOut, any>) {
        super();
        this.inputNode = inputNode;
        this.outputNode = outputNode;

        // Register default push and pull handling
        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));
    }

    private _onPush(data: InOut | InOut[], options: PushOptions): Promise<void> {
        return this.outputNode.push(data, options);
    }

    private _onPull(options: PullOptions): Promise<void> {
        return this.inputNode.pull(options);
    }

    /**
     * Push data to the output node
     * @param {DataFrame | DataFrame[]} data Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    push(data: InOut | InOut[], options: PushOptions = {}): Promise<void> {
        return new Promise((resolve) => {
            const newOptions: PushOptions = {
                ...options,
                lastNode: this.inputNode.uid,
            };
            const pushListeners: Array<(data: InOut | InOut[], options: PushOptions) => Promise<void>> = this.listeners(
                'push',
            ) as any[];
            Promise.all(pushListeners.map((listener) => listener(data, newOptions)))
                .then(() => {
                    resolve();
                })
                .catch((ex) => {
                    // Error handling is done in the edge
                    if (Array.isArray(data)) {
                        data.forEach((frame) => {
                            this.inputNode.emit('error', new PushError(frame.uid, this.outputNode.uid, ex));
                        });
                    } else {
                        this.inputNode.emit('error', new PushError(data.uid, this.outputNode.uid, ex));
                    }
                });
        });
    }

    /**
     * Pull data from the input node
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    pull(options?: PullOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const pullListeners: Array<(options: PullOptions) => Promise<void>> = this.listeners('pull') as any[];
            Promise.all(pullListeners.map((listener) => listener(options)))
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    emit(name: 'completed', event: PushCompletedEvent): boolean;
    emit(name: 'error', event: PushError): boolean;
    emit(name: string, event: any): boolean {
        return this.inputNode.emit(name, event);
    }

    /**
     * Event when a data frame is pulled
     * @param {string} name receive
     * @param {Function} listener Event callback
     */
    on(name: 'pull', listener: (options?: PullOptions) => Promise<void> | void): this;
    /**
     * Event when a data frame is push to the node
     * @param {string} name receive
     * @param {Function} listener Event callback
     */
    on(name: 'push', listener: (frame: InOut, options?: PushOptions) => Promise<void> | void): this;
    on(name: string | symbol, listener: (...args: any[]) => void): this {
        this.removeAllListeners(name);
        return super.on(name, listener);
    }
}
