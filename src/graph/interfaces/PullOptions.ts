import { GraphOptions } from './GraphOptions';

/**
 * Provides options for pull requests to nodes
 *
 * @category Graph
 */
export interface PullOptions extends GraphOptions {
    /**
     * Number of frames to request
     */
    count?: number;
    /**
     * Requested objects UIDs
     */
    requestedObjects?: string[];
}
