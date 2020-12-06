import { DataFrame, DataObject } from '../data';
import { Node, NodeOptions } from '../Node';
import { NodeDataService, NodeData } from '../service';
import { Model } from '../Model';
import { GraphOptions, PushOptions } from '../graph';

/**
 * Processing node
 */
export abstract class ProcessingNode<In extends DataFrame = DataFrame, Out extends DataFrame = DataFrame> extends Node<
    In,
    Out
> {
    protected options: ProcessingNodeOptions;

    constructor(options?: ProcessingNodeOptions) {
        super(options);
        this.options.frameFilter = this.options.frameFilter || (() => true);
        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: In | In[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const model = this.graph as Model;
            const processPromises: Array<Promise<Out>> = [];

            if (Array.isArray(frame)) {
                frame.filter(this.options.frameFilter).forEach((f) => {
                    processPromises.push(this.process(f, options));
                });
            } else if (this.options.frameFilter(frame)) {
                processPromises.push(this.process(frame, options));
            }

            const output: Out[] = [];
            Promise.all(processPromises)
                .then((results) => {
                    const servicePromises: Array<Promise<unknown>> = [];
                    results.forEach((result) => {
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
                })
                .then(() => {
                    const pushPromises: Array<Promise<void>> = [];
                    output.forEach((out) => {
                        this.outputNodes.forEach((node) => {
                            pushPromises.push(node.push(out, options));
                        });
                    });
                    return Promise.all(pushPromises);
                })
                .then(() => resolve())
                .catch((ex) => {
                    if (ex === undefined) {
                        this.logger('warning', {
                            message: `Exception thrown in processing node ${this.uid} but no exception given!`,
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
     * @param {DataObject} dataObject Data object to get node data from
     * @returns {Promise<any>} Promise with node data
     */
    protected getNodeData(dataObject: DataObject): Promise<any> {
        return new Promise((resolve, reject) => {
            this.findNodeDataService().findData(this.uid, dataObject).then(resolve).catch(reject);
        });
    }

    /**
     * Set node data
     *
     * @param {DataObject} dataObject Data object to store data for
     * @param {any} data Data to store
     * @returns {Promise<any>} Promise with stored node data
     */
    protected setNodeData(dataObject: DataObject, data: any): Promise<NodeData> {
        return new Promise((resolve, reject) => {
            this.findNodeDataService().insertData(this.uid, dataObject, data).then(resolve).catch(reject);
        });
    }

    public abstract process(frame: In, options?: PushOptions): Promise<Out>;
}

export interface ProcessingNodeOptions extends NodeOptions {
    /**
     * Frame filter to specify what frames are processed by this node
     */
    frameFilter?: (frame: DataFrame) => boolean;
}
