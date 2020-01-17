import { Node } from "../Node";
import { DataFrame } from "../data/DataFrame";
import { GraphPullOptions } from "../graph/GraphPullOptions";
import { ServiceMergeNode } from "./processing/ServiceMergeNode";
import { GraphBuilder, EdgeBuilder } from "../graph";

export abstract class SourceNode<Out extends DataFrame> extends Node<Out, Out> {
    private _ignoreMerging: boolean;

    /**
     * Construct a new source node
     * 
     * @param ignoreMerging When set to true, the data frames will not be merged with
     * services 
     */
    constructor(ignoreMerging: boolean = false) {
        super();
        this._ignoreMerging = ignoreMerging;
        this.on('pull', this._onPull.bind(this));
        this.on('build', this._onBuild.bind(this));
    }

    private _onBuild(graphBuilder: GraphBuilder<any, any, any>): void {
        if (this._ignoreMerging) {
            return;
        }

        // Add a service merge node between this node and output nodes
        const mergeNode = new ServiceMergeNode<Out>();
        mergeNode.name = this.name + "_service_merge";
        mergeNode.graph = this.graph;
        mergeNode.logger = this.logger;
        graphBuilder.addNode(mergeNode);
        this.graph.edges.forEach(edge => {
            if (edge.inputNode === this) {
                graphBuilder.deleteEdge(edge);
                graphBuilder.addEdge(new EdgeBuilder<Out>()
                    .withInput(mergeNode)
                    .withOutput(edge.outputNode)
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
                    const promises = new Array();
                    this.outputNodes.forEach(node => {
                        promises.push(node.push(frame, options));
                    });
                    Promise.all(promises).then(_ => {
                        resolve();
                    }).catch(ex => {
                        reject(ex);
                    });
                }
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract onPull(options?: GraphPullOptions): Promise<Out>;

}
