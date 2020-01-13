import { Node } from "../Node";
import { DataFrame } from "../data/DataFrame";
import { GraphPullOptions } from "../graph/GraphPullOptions";
import { ServiceMergeNode } from "./shapes/ServiceMergeNode";
import { GraphBuilder, EdgeBuilder } from "../graph";

export abstract class SourceNode<Out extends DataFrame> extends Node<Out, Out> {

    constructor() {
        super();
        this.on('pull', this._onPull.bind(this));
        this.on('build', this._onBuild.bind(this));
    }

    private _onBuild(graphBuilder: GraphBuilder<any, any, any>): void {
        // Add a service merge node between this node and output nodes
        const mergeNode = new ServiceMergeNode<Out>();
        mergeNode.setName(this.getName() + "_server_merge");
        mergeNode.setGraph(this.getGraph());
        graphBuilder.addNode(mergeNode);
        this.getGraph().getEdges().forEach(edge => {
            if (edge.getInputNode() === this) {
                graphBuilder.deleteEdge(edge);
                graphBuilder.addEdge(new EdgeBuilder<Out>()
                    .withInput(mergeNode)
                    .withOutput(edge.getOutputNode())
                    .build());
            }
        });
        graphBuilder.addEdge(new EdgeBuilder<Out>()
            .withInput(this)
            .withOutput(mergeNode)
            .build());
    }

    private _onPull(options?: GraphPullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.onPull(options).then(frame => {
                if (frame !== null || frame !== undefined) {
                    this.getOutputNodes().forEach(node => {
                        node.push(frame, options);
                    });
                }
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract onPull(options?: GraphPullOptions): Promise<Out>;

}
