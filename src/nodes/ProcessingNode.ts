import { DataFrame, DataObject } from '../data';
import { Node, NodeOptions } from '../Node';
import { NodeDataService, NodeData } from '../service';
import { PushOptions } from '../graph/options';
import { SerializableObject } from '../data/decorators';

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
 * // ...
 * public process(data: In, options?: GraphOptions): Promise<Out> {
 * return new Promise<Out>((resolve, reject) => {
 * // ... process/manipulate the data frame
 * data.addObject(new DataObject("custom_process_object"));
 * resolve(data);
 * });
 * }
 * }
 * ```
 * @category Processing node
 */
@SerializableObject()
export abstract class ProcessingNode<In extends DataFrame = DataFrame, Out extends DataFrame = DataFrame> extends Node<
    In,
    Out
> {
    protected declare options: ProcessingNodeOptions;

    constructor(options?: ProcessingNodeOptions) {
        super(options);
        this.options.frameFilter = this.options.frameFilter || (() => true);
        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: In | In[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const processPromises: Array<Promise<Out | Out[]>> = [];

            if (Array.isArray(frame)) {
                processPromises.push(this.processBulk(frame.filter((frame) => this.options.frameFilter(frame))));
                frame
                    .filter((frame) => !this.options.frameFilter(frame))
                    .forEach((f) => {
                        processPromises.push(Promise.resolve(f as any));
                    });
            } else if (this.options.frameFilter(frame)) {
                processPromises.push(this.process(frame, options));
            } else {
                processPromises.push(Promise.resolve(frame as any));
            }

            Promise.all(processPromises)
                .then((results) => {
                    const output: Out[] = [];
                    results.forEach((res) => {
                        if (Array.isArray(res)) {
                            output.push(...res.filter((res) => res !== undefined));
                        } else if (res !== undefined) {
                            output.push(res);
                        }
                    });
                    if (output.length > 0) {
                        this.outlets.forEach((outlet) =>
                            outlet.push(output.length === 1 ? output[0] : output, options),
                        );
                    }
                    resolve();
                })
                .catch((ex) => {
                    if (ex === undefined) {
                        this.logger('warn', `Exception thrown in processing node ${this.uid} but no exception given!`);
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
     * @param {DataObject} dataObject Data object to get node data from
     * @param {any} [defaultData] Default data
     * @returns {Promise<any>} Promise with node data
     */
    protected getNodeData<T = any>(dataObject: DataObject, defaultData: T = undefined): Promise<any> {
        return new Promise((resolve, reject) => {
            this.findNodeDataService()
                .findData(this.uid, dataObject)
                .then((data) => {
                    if (!data) {
                        resolve(defaultData);
                    } else {
                        resolve(data);
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Set node data
     * @param {DataObject} dataObject Data object to store data for
     * @param {any} data Data to store
     * @returns {Promise<any>} Promise with stored node data
     */
    protected setNodeData(dataObject: DataObject, data: any): Promise<NodeData> {
        return new Promise((resolve, reject) => {
            this.findNodeDataService().insertData(this.uid, dataObject, data).then(resolve).catch(reject);
        });
    }

    processBulk(frames: In[]): Promise<Out[]> {
        return Promise.all(frames.map((frame) => this.process(frame)));
    }

    public abstract process(frame: In, options?: PushOptions): Promise<Out>;
}

export interface ProcessingNodeOptions extends NodeOptions {
    /**
     * Frame filter to specify what frames are processed by this node
     */
    frameFilter?: (frame: DataFrame) => boolean;
}
