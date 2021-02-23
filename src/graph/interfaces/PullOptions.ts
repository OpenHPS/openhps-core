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
    /**
     * Sequential pulling. If set to true, the pulling will be done sequentially where
     * the next pull is only performed after the push is completed.
     *
     * @default true
     */
    sequentialPull?: boolean;
    /**
     * Pull from a specific source node UID
     */
    sourceNode?: string;
}
