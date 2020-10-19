import { AbstractNode } from './AbstractNode';
import { DataFrame } from '../../data';
import { PushOptions } from './PushOptions';
import { PullOptions } from './PullOptions';

export interface AbstractEdge<InOut extends DataFrame> {
    /**
     * Get unique identifier of edge
     */
    uid: string;

    /**
     * Get input node of edge
     */
    inputNode: AbstractNode<any, InOut>;

    /**
     * Get output node of edge
     */
    outputNode: AbstractNode<InOut, any>;

    /**
     * Push data to the output node
     *
     * @param {InOut | InOut[]} frame Data frame to push
     * @param {PushOptions} [options] Push options
     */
    push(frame: InOut | InOut[], options?: PushOptions): Promise<void>;

    /**
     * Pull data from the input node
     *
     * @param {PullOptions} [options] Pull options
     */
    pull(options?: PullOptions): Promise<void>;
}
