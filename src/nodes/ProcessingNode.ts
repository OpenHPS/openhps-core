import { DataFrame, DataObject } from '../data';
import { Node, NodeOptions } from '../Node';
import { NodeDataService, NodeData } from '../service';
import { PushOptions } from '../graph';

/**
 * Node that processes a dataframe or the contained objects.
 *
 * ## Usage
 *
 * ### Creating a ProcessingNode
 * Processing nodes hide the push and pull functionalities from a regular node. When a push is received, this
 * data frame is provided to the ```process()``` method that has to be implemented. When a pull is received, this pull is
 * forwarded to all incoming nodes.
 * ```typescript
 * import { DataFrame, DataObject, ProcessingNode } from '@openhps/core';
 *
 * export class CustomProcessingNode<In extends DataFrame, Out extends DataFrame> extends ProcessingNode<In, Out> {
 *     // ...
 *     public process(data: In, options?: GraphOptions): Promise<Out> {
 *         return new Promise<Out>((resolve, reject) => {
 *             // ... process/manipulate the data frame
 *             data.addObject(new DataObject("custom_process_object"));
 *             resolve(data);
 *         });
 *     }
 * }
 * ```
 *
 * @category Processing node
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
                            output.push(result);
                        }
                    });
                    return Promise.all(servicePromises);
                })
                .then(() => {
                    if (output.length > 0) {
                        this.outlets.forEach((outlet) =>
                            outlet.push(output.length === 1 ? output[0] : output, options),
                        );
                    }
                    resolve();
                })
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
        return this.model.findDataService(NodeData);
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
