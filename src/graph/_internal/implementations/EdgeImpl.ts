import { AbstractEdge } from '../../interfaces/AbstractEdge';
import { v4 as uuidv4 } from 'uuid';
import { AbstractNode, PullOptions, PushOptions } from '../../interfaces';
import { DataFrame } from '../../../data';

export class EdgeImpl<InOut extends DataFrame> implements AbstractEdge<InOut> {
    /**
     * Unique identifier of edge
     */
    public uid: string = uuidv4();
    public inputNode: AbstractNode<any, InOut>;
    public outputNode: AbstractNode<InOut, any>;

    /**
     * Push data to the output node
     *
     * @param {DataFrame | DataFrame[]} frame Data frame to push
     * @param {PushOptions} [options] Push options
     * @returns {Promise<void>} Push promise
     */
    public push(frame: InOut | InOut[], options?: PushOptions): Promise<void> {
        return this.outputNode.push(frame, options);
    }

    /**
     * Pull data from the input node
     *
     * @param {PullOptions} [options] Pull options
     * @returns {Promise<void>} Pull promise
     */
    public pull(options?: PullOptions): Promise<void> {
        return this.inputNode.pull(options);
    }
}
