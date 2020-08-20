import { AbstractEdge } from './AbstractEdge';
import { DataFrame } from '../../data/DataFrame';
import { AbstractNode } from './AbstractNode';

export interface AbstractGraph<In extends DataFrame, Out extends DataFrame> extends AbstractNode<In, Out> {
    /**
     * Get unique identifier of graph
     */
    uid: string;

    /**
     * Get all the edges in the graph
     */
    edges: Array<AbstractEdge<any>>;

    /**
     * Get all the nodes in the graph
     */
    nodes: Array<AbstractNode<any, any>>;
}
