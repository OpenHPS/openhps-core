import { DataFrame } from "../data/DataFrame";
import { ServiceMergeNode } from "./processing/ServiceMergeNode";
import { ModelBuilder } from "../ModelBuilder";
import { DataObject } from "../data";
import { EdgeBuilder } from "../graph/builders/EdgeBuilder";
import { AbstractSourceNode } from "./_internal/interfaces/AbstractSourceNode";

/**
 * Source node
 */
export abstract class SourceNode<Out extends DataFrame | DataFrame[]> extends AbstractSourceNode<Out> {
    private _source: DataObject;
    private _ignoreMerging: boolean;

    /**
     * Construct a new source node
     * 
     * @param ignoreMerging When set to true, the data frames will not be merged with
     * services 
     */
    constructor(source: DataObject, ignoreMerging: boolean = false) {
        super();
        this._source = source;
        
        this._ignoreMerging = ignoreMerging;
        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));
        this.once('build', this._onBuild.bind(this));
    }

    private _onBuild(graphBuilder: ModelBuilder<any, any>): void {
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

        this.emit('ready');
    }

    private _onPush(frame: Out): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const servicePromises = new Array();
            const pushPromises = new Array();

            if (frame instanceof Array) {
                frame.forEach(f => {
                    if (f !== null || f !== undefined) {
                        const frameService = this.getDataFrameService(f);
                        
                        if (frameService !== null && frameService !== undefined) { 
                            // Update the frame
                            servicePromises.push(frameService.insert(f));
                        }
                    } else {
                        // No frame provided in pull
                        return resolve();
                    }
                });
            } else {
                if (frame !== null || frame !== undefined) {
                    const frameService = this.getDataFrameService(frame as DataFrame);
                    
                    if (frameService !== null && frameService !== undefined) { 
                        // Update the frame
                        servicePromises.push(frameService.insert(frame as DataFrame));
                    }
                } else {
                    // No frame provided in pull
                    return resolve();
                }
            }
            
            this.outputNodes.forEach(node => {
                pushPromises.push(node.push(frame));
            });
            
            Promise.all(pushPromises).then(_ => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    private _onPull(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.onPull().then(frame => {
                if (frame !== undefined && frame !== null) {
                    return this.push(frame);
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

    public get source(): DataObject {
        return this._source;
    }

    public set source(source: DataObject) {
        this._source = source;
    }

    public abstract onPull(): Promise<Out>;

}
