import { DataFrame } from '../../data/DataFrame';
import { AsyncEventEmitter } from '../../_internal/AsyncEventEmitter';
import { PullOptions } from './PullOptions';
import { PushOptions } from './PushOptions';

export interface AbstractNode<In extends DataFrame, Out extends DataFrame> extends AsyncEventEmitter {
    /**
     * Get unique identifier of node
     */
    uid: string;

    /**
     * Node name
     */
    name: string;

    /**
     * Push data to the node
     *
     * @param {DataFrame | DataFrame[]} frame Data frame to push
     * @param {PushOptions} [options] Push options
     */
    push(frame: In | In[], options?: PushOptions): Promise<void>;

    /**
     * Pull data from the node
     *
     * @param {PullOptions} [options] Pull options
     */
    pull(options?: PullOptions): Promise<void>;
}
