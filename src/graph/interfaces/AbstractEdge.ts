import { AbstractNode } from './AbstractNode';
import { DataFrame } from '../../data';

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
     * @param frame Data frame to push
     */
    push(frame: InOut | InOut[]): Promise<void>;

    /**
     * Pull data from the input node
     */
    pull(): Promise<void>;
}
