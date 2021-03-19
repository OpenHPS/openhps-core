import { DataFrame } from '../data/DataFrame';
import { Edge } from './Edge';
import { GraphNode } from './_internal/GraphNode';

export interface Graph<In extends DataFrame, Out extends DataFrame> extends GraphNode<In, Out> {
    internalSink: GraphNode<any, any>;
    internalSource: GraphNode<any, any>;
    edges: Array<Edge<any>>;
    nodes: Array<GraphNode<any, any>>;
    /**
     * Find a node by its identifier
     *
     * @param {string} uid Node identifier
     * @returns {GraphNode<any, any>} Graph node
     */
    findNodeByUID(uid: string): GraphNode<any, any>;
    /**
     * Find a node by its name
     *
     * @param {string} name Node name
     * @returns {GraphNode<any, any>} Graph node
     */
    findNodeByName(name: string): GraphNode<any, any>;
    addNode(node: GraphNode<any, any>): void;
    addEdge(edge: Edge<any>): void;
    deleteEdge(edge: Edge<any>): void;
    deleteNode(node: GraphNode<any, any>): void;
}
