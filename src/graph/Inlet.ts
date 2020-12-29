import { DataFrame } from '../data';
import { PushCompletedEvent, PushError } from './events';
import { PullOptions, PushOptions } from './interfaces';

/**
 * Inlet of a node
 */
export interface Inlet<In extends DataFrame> {
    /**
     * Pull data from the inlet
     *
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    pull(options?: PullOptions): Promise<void>;

    /**
     * Emit completed event
     *
     * @param {string} name completed
     */
    emit(name: 'completed', event: PushCompletedEvent): boolean;
    /**
     * Emit error
     *
     * @param {string} name error
     */
    emit(name: 'error', event: PushError): boolean;

    /**
     * Event when a data frame is push to the node
     *
     * @param {string} name receive
     * @param {Function} listener Event callback
     */
    on(name: 'push', listener: (frame: In, options?: PushOptions) => Promise<void> | void): this;
}
