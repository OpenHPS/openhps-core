import { DataFrame, DataObject } from "../data";
import { Node } from "../Node";
import { NodeDataService, NodeData } from "../service";
import { Model } from "../Model";

/**
 * Processing node
 */
export abstract class ProcessingNode<In extends DataFrame | DataFrame[] = DataFrame, Out extends DataFrame | DataFrame[] = DataFrame> extends Node<In, Out> {

    constructor() {
        super();

        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const servicePromises = new Array();
            const pushPromises = new Array();
            const model = (this.graph as Model);

            this.process(frame).then(result => {
                if (result === null || result === undefined) {
                    return resolve();
                } else if (Array.isArray(result)) {
                    return resolve();
                } else {
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
                }
                
                this.outputNodes.forEach(node => {
                    pushPromises.push(node.push(result));
                });
            }).catch(ex => {
                if (ex === undefined) {
                    this.logger("warning", {
                        message: `Exception thrown in processing node ${this.uid} but no exception given!`
                    });
                }
                reject(ex);
            });

            // Push processed result to the next node
            Promise.all(servicePromises).then(() => {
                return Promise.all(pushPromises);
            }).then(() => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    protected findNodeDataService(): NodeDataService<NodeData> {
        return (this.graph as Model).findDataService(NodeData);
    }

    /**
     * Get node data
     * @param dataObject 
     */
    protected getNodeData(dataObject: DataObject): Promise<any> {
        return new Promise((resolve, reject) => {
            this.findNodeDataService().findData(this.uid, dataObject).then(data => {
                resolve(data);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Set node data
     * @param dataObject 
     * @param data 
     */
    protected setNodeData(dataObject: DataObject, data: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.findNodeDataService().insertData(this.uid, dataObject, data).then(() => {
                resolve();
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    public abstract process(frame: In): Promise<Out>;
}
