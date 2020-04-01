import { AbstractNode } from './AbstractNode';
import { DataFrame } from '../../data';

export interface AbstractEdge<InOut extends DataFrame | DataFrame[]> {
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
     * Serialize the edge connection
     */
    serialize(): Object;
}
