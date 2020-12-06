import { GraphOptions } from './GraphOptions';

/**
 * Provides options of push actions to nodes.
 */
export interface PushOptions extends GraphOptions {
    pushNode?: string;
    sourceNode?: string;
}
