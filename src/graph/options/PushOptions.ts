import { GraphOptions } from './GraphOptions';

/**
 * Provides options of push actions to nodes.
 * @category Graph
 */
export interface PushOptions extends GraphOptions {
    /**
     * Source node that started the original push
     */
    sourceNode?: string;
    /**
     * Last node UID
     */
    lastNode?: string;
}
