import { DataFrame } from '../data';
import { PullPromise } from './PullPromise';
import { PushPromise } from './PushPromise';
import type { GraphNode } from './_internal/GraphNode';
import { PullOptions, PushOptions } from './options';

/**
 * Outlet of a node that supports push events and pull listening.
 * @category Graph
 */
export interface Outlet<Out extends DataFrame> {
    /**
     * Push data to the outlet
     * @param {DataFrame | DataFrame[]} data Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {PushPromise<void>} Push promise
     */
    push(data: Out | Out[], options?: PushOptions): PushPromise<void> | Promise<void>;

    /**
     * Event when a data frame is pulled
     * @param {string} name receive
     * @param {Function} listener Event callback
     */
    on(name: 'pull', listener: (options?: PullOptions) => PullPromise<void> | Promise<void> | void): this;

    /**
     * Get the node of the outlet
     */
    get outletNode(): GraphNode<Out, any>;
}
