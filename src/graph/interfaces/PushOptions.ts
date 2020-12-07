import { GraphOptions } from './GraphOptions';

/**
 * Provides options of push actions to nodes.
 */
export interface PushOptions extends GraphOptions {
    /**
     * Source node that started the original push
     */
    sourceNode?: string;
}
