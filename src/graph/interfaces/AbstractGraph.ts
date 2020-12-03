import { AbstractEdge } from './AbstractEdge';
import { DataFrame } from '../../data/DataFrame';
import { AbstractNode } from './AbstractNode';

export interface AbstractGraph<In extends DataFrame, Out extends DataFrame> extends AbstractNode<In, Out> {
    /**
     * Get unique identifier of graph
     */
    uid: string;

    /**
     * Get the internal input node
     */
    internalInput?: AbstractNode<In, any>;

    /**
     * Get the external output node
     */
    internalOutput?: AbstractNode<any, Out>;

    /**
     * Get all the edges in the graph
     */
    edges: Array<AbstractEdge<any>>;

    /**
     * Get all the nodes in the graph
     */
    nodes: Array<AbstractNode<any, any>>;

    logger: (level: string, log: any) => void;
}
