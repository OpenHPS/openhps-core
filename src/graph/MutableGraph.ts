import { DataFrame } from '../data';
import { Edge } from './Edge';
import { ImmutableGraph } from './ImmutableGraph';
import { GraphNode } from './_internal/GraphNode';

export interface MutableGraph<In extends DataFrame, Out extends DataFrame> extends ImmutableGraph<In, Out> {
    addNode(node: GraphNode<any, any>): void;

    addEdge(edge: Edge<any>): void;

    deleteEdge(edge: Edge<any>): void;

    deleteNode(node: GraphNode<any, any>): void;
}
