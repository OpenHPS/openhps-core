import { AbstractNode } from './AbstractNode';
import { DataFrame } from '../../data';

export interface AbstractEdge<InOut extends DataFrame> {
    /**
     * Get unique identifier of edge
     */
    getUID(): string;

    /**
     * Get input node of edge
     */
    getInputNode(): AbstractNode<any, InOut>;

    /**
     * Get output node of edge
     */
    getOutputNode(): AbstractNode<InOut, any>;

    /**
     * Serialize the edge connection
     */
    serialize(): Object;
}
