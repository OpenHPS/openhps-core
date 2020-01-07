import { AbstractEdge } from './AbstractEdge';
import { DataFrame } from '../../data/DataFrame';
import { AbstractNode } from './AbstractNode';

export interface AbstractGraph<In extends DataFrame, Out extends DataFrame> extends AbstractNode<In, Out> {
    /**
     * Get unique identifier of graph
     */
    getUID(): string;

    /**
     * Get all the edges in the graph
     */
    getEdges(): Array<AbstractEdge<any>>;

    /**
     * Get all the nodes in the graph
     */
    getNodes(): Array<AbstractNode<any, any>>;

    /**
     * Serialize the complete graph
     */
    serialize(): Object;

}
