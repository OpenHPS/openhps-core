import { DataFrame } from '../data/DataFrame';
import { Edge } from './Edge';
import { GraphNode } from './_internal/GraphNode';

export interface ImmutableGraph<In extends DataFrame, Out extends DataFrame> extends GraphNode<In, Out> {
    edges: Array<Edge<any>>;
    nodes: Array<GraphNode<any, any>>;
    findNodeByUID(uid: string): GraphNode<any, any>;
    findNodeByName(name: string): GraphNode<any, any>;
}
