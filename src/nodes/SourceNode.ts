import { Node } from "../Node";
import { DataFrame } from "../data/DataFrame";
import { GraphPullOptions } from "../graph/GraphPullOptions";
import { ServiceMergeNode } from "./processing/ServiceMergeNode";
import { GraphBuilder, EdgeBuilder, GraphPushOptions } from "../graph";

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
        this.on('push', this._onPush.bind(this));
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

    private _onPush(frame: Out, options?: GraphPushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (frame !== null || frame !== undefined) {
                const servicePromises = new Array();

                const frameService = this.getDataFrameService(frame);
                
                if (frameService !== null && frameService !== undefined) { 
                    // Update the frame
                    servicePromises.push(frameService.update(frame));
                }

                const pushPromises = new Array();
                this.outputNodes.forEach(node => {
                    pushPromises.push(node.push(frame, options));
                });
                Promise.all(pushPromises).then(_ => {
                    resolve();
                }).catch(ex => {
                    reject(ex);
                });
            } else {
                // No frame provided in pull
                resolve();
            }
        });
    }

    private _onPull(options?: GraphPullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.onPull(options).then(frame => {
                if (frame !== undefined && frame !== null) {
                    return this.push(frame, options);
                } else {
                    resolve();
                }
            }).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract onPull(options?: GraphPullOptions): Promise<Out>;

}
