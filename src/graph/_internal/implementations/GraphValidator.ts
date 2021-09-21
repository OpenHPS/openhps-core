import { GraphNode } from '../GraphNode';
import { GraphShape } from './GraphShape';

export class GraphValidator {
    static validate(graph: GraphShape<any, any>): void {
        this.validateNodes(graph);
        this.validateEdges(graph);
    }

    private static _validateInternalNode(graph: GraphShape<any, any>, node: GraphNode<any, any>): void {
        if (node.outlets.length === 0 && node.inlets.length === 0) {
            graph.deleteNode(node);
        } else if (!graph.findNodeByUID(node.uid)) {
            throw new Error(`Internal node ${node.uid} (${node.name}) is not connected to the graph!`);
        }
    }

    static validateNodes(graph: GraphShape<any, any>): void {
        GraphValidator._validateInternalNode(graph, graph.internalSource);
        GraphValidator._validateInternalNode(graph, graph.internalSink);

        graph.nodes.forEach((node) => {
            if (node.graph === undefined) {
                throw new Error(`Node ${node.uid} (${node.name}) does not have a graph set!`);
            }
            if (node.inlets.length === 0 && node.outlets.length === 0) {
                throw new Error(`Node ${node.uid} (${node.name}) is not connected to the graph!`);
            }
        });
    }

    static validateEdges(graph: GraphShape<any, any>): void {
        graph.edges.forEach((edge) => {
            if (!graph.findNodeByUID(edge.inputNode.uid)) {
                throw new Error(
                    `Node ${edge.inputNode.uid} (${edge.inputNode.name}) is used in an edge but not added to the graph!`,
                );
            } else if (!graph.findNodeByUID(edge.outputNode.uid)) {
                throw new Error(
                    `Node ${edge.outputNode.uid} (${edge.outputNode.name}) is used in an edge but not added to the graph!`,
                );
            }
        });
    }
}
