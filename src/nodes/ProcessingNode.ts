import { DataFrame, DataObject } from "../data";
import { Node, NodeOptions } from "../Node";
import { NodeDataService, NodeData } from "../service";
import { Model } from "../Model";

/**
 * Processing node
 */
export abstract class ProcessingNode<In extends DataFrame = DataFrame, Out extends DataFrame = DataFrame> extends Node<In, Out> {
    protected options: ProcessingNodeOptions;

    private _frameFilter: (frame: DataFrame) => boolean = () => true;

    constructor(options?: ProcessingNodeOptions) {
        super(options);
        this._frameFilter = this.options.frameFilter || this._frameFilter;
        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: In | In[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const model = (this.graph as Model);
            const processPromises: Array<Promise<Out>> = [];

            if (Array.isArray(frame)) {
                frame.filter(this._frameFilter).forEach(f => {
                    processPromises.push(this.process(f));
                });
            } else if (this._frameFilter(frame)) {
                processPromises.push(this.process(frame));
            }

            const output: Out[] = [];
            Promise.all(processPromises).then(results => {
                const servicePromises: Array<Promise<unknown>> = [];
                results.forEach(result => {
                    if (result) {
                        const oldFrameService = model.findDataService(frame);
                        const frameService = model.findDataService(result);
                        
                        if (frameService !== null && frameService !== undefined) { 
                            if (frameService.name !== oldFrameService.name) {
                                // Delete frame from old service
                                servicePromises.push(oldFrameService.delete((frame as DataFrame).uid));
                            }
                            
                            // Update the frame
                            servicePromises.push(frameService.insert((result as DataFrame).uid, result));
                        }
                        output.push(result);
                    }
                });
                return Promise.all(servicePromises);
            }).then(() => {
                const pushPromises: Array<Promise<void>> = [];
                output.forEach(out => {
                    this.outputNodes.forEach(node => {
                        pushPromises.push(node.push(out));
                    });
                });
                return Promise.all(pushPromises);
            }).then(() => resolve()).catch(ex => {
                if (ex === undefined) {
                    this.logger("warning", {
                        message: `Exception thrown in processing node ${this.uid} but no exception given!`
                    });
                }
                reject(ex);
            });
        });
    }

    protected findNodeDataService(): NodeDataService<NodeData> {
        return (this.graph as Model).findDataService(NodeData);
    }

    /**
     * Get node data
     *
     * @param dataObject 
     */
    protected getNodeData(dataObject: DataObject): Promise<any> {
        return new Promise((resolve, reject) => {
            this.findNodeDataService().findData(this.uid, dataObject).then(data => {
                resolve(data);
            }).catch(reject);
        });
    }

    /**
     * Set node data
     *
     * @param dataObject 
     * @param data 
     */
    protected setNodeData(dataObject: DataObject, data: any): Promise<NodeData> {
        return new Promise((resolve, reject) => {
            this.findNodeDataService().insertData(this.uid, dataObject, data).then(resolve).catch(reject);
        });
    }

    public abstract process(frame: In): Promise<Out>;
}

export interface ProcessingNodeOptions extends NodeOptions {
    /**
     * Frame filter to specify what frames are processed by this node
     */
    frameFilter?: (frame: DataFrame) => boolean;
}
