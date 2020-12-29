import { PushCompletedEvent, PushError } from './events';
import { PullOptions } from './interfaces';

/**
 * Inlet of a node
 */
export interface Inlet {
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
}
