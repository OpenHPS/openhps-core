import { DataFrame } from '../data';
import { PushOptions } from './interfaces';

/**
 * Outlet of a node
 */
export interface Outlet<Out extends DataFrame> {
    /**
     * Push data to the outlet
     *
     * @param {DataFrame | DataFrame[]} data Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    push(data: Out | Out[], options?: PushOptions): Promise<void>;
}
