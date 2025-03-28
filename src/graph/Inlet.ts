import { DataFrame } from '../data';
import { PullPromise } from './PullPromise';
import { PushPromise } from './PushPromise';
import type { GraphNode } from './_internal/GraphNode';
import { PushCompletedEvent, PushError } from './events';
import { PullOptions, PushOptions } from './options';

/**
 * Inlet of a node that supports pulling and events.
 * @category Graph
 */
export interface Inlet<In extends DataFrame> {
    /**
     * Pull data from the inlet
     * @param {PullOptions} [options] Pull options
     * @returns {PullPromise<void>} Pull promise
     */
    pull(options?: PullOptions): PullPromise<void> | Promise<void>;

    /**
     * Emit unknown event
     * @param {string} name completed
     * @param {any} arg Argument
     */
    emit(name: string, arg: any): boolean;
    /**
     * Emit completed event
     * @param {string} name completed
     */
    emit(name: 'completed', event: PushCompletedEvent): boolean;
    /**
     * Emit error
     * @param {string} name error
     */
    emit(name: 'error', event: PushError): boolean;

    /**
     * Event when a data frame is push to the node
     * @param {string} name receive
     * @param {Function} listener Event callback
     */
    on(name: 'push', listener: (frame: In, options?: PushOptions) => PushPromise<void> | Promise<void> | void): this;

    /**
     * Get the node of the inlet
     */
    get inletNode(): GraphNode<any, In>;
}
