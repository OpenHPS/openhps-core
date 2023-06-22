import { DataFrame, DataObject } from '../data';
import { ProcessingNode, ProcessingNodeOptions } from './ProcessingNode';
import { DataObjectService } from '../service';
import { GraphOptions } from '../graph/options';

/**
 * Processing node that processes each {@link DataObject} in a {@link DataFrame} individually
 *
 * ## Usage
 *
 * ### Creating an ObjectProcessingNode
 * Extended on a {@link ProcessingNode} is an object processing node that processes individual objects in each frame.
 * ```typescript
 * import { DataFrame, DataObject, ObjectProcessingNode } from '@openhps/core';
 *
 * export class CustomObjectProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
 * // ...
 * public processObject(object: DataObject, frame?: DataFrame): Promise<DataObject> {
 * return new Promise<DataObject>((resolve, reject) => {
 * // Manipulate the object
 * object.displayName = "test";
 * resolve(object);
 * });
 * }
 * }
 * ```
 *
 * @category Processing node
 */
export abstract class ObjectProcessingNode<InOut extends DataFrame = DataFrame> extends ProcessingNode<InOut, InOut> {
    protected options: ObjectProcessingNodeOptions;

    constructor(options?: ObjectProcessingNodeOptions) {
        super(options);
        this.options.objectFilter = this.options.objectFilter || (() => true);
    }

    public process(frame: InOut, options?: GraphOptions): Promise<InOut> {
        return new Promise<InOut>((resolve, reject) => {
            const processObjectPromises: Array<Promise<DataObject>> = [];
            const uids = [];
            const sourceUID = frame.source ? frame.source.uid : undefined;
            frame
                .getObjects()
                .filter((value) => this.options.objectFilter(value, frame))
                .forEach((object) => {
                    uids.push(object.uid);
                    processObjectPromises.push(this.processObject(object, frame, options));
                });
            Promise.all(processObjectPromises)
                .then((objects) => {
                    frame.clearObjects();
                    objects.forEach((object, index) => {
                        const oldUID = uids[index];
                        frame.addObject(object);
                        if (oldUID === sourceUID) {
                            frame.source = object;
                        }
                    });
                    resolve(frame);
                })
                .catch(reject);
        });
    }

    /**
     * Process an individual data object
     *
     * @param {DataObject} dataObject Data object to process
     * @param {DataFrame} dataFrame Data frame this object belongs to
     * @param {GraphOptions} options Graph options
     * @returns {Promise<DataObject>} Processed data object promise
     */
    public abstract processObject(
        dataObject: DataObject,
        dataFrame?: InOut,
        options?: GraphOptions,
    ): Promise<DataObject>;

    /**
     * Find an object by its uid
     *
     * @param {string} uid Unique identifier of object to find
     * @param {DataFrame} dataFrame Optional data frame to look in
     * @param {string} type Optional type of the object to find
     * @returns {Promise<DataObject>} Data object promise if found
     */
    protected findObjectByUID(uid: string, dataFrame?: InOut, type?: string): Promise<DataObject> {
        if (dataFrame !== undefined) {
            if (dataFrame.hasObject(new DataObject(uid))) {
                return new Promise<DataObject>((resolve) => {
                    resolve(dataFrame.getObjectByUID(uid));
                });
            }
        }

        let service: DataObjectService<DataObject>;
        if (type !== undefined) {
            service = this.model.findDataService(type) as DataObjectService<DataObject>;
        }
        service = service || this.model.findDataService(DataObject);

        return new Promise((resolve) => {
            service
                .findByUID(uid)
                .then(resolve)
                .catch(() => resolve(undefined));
        });
    }
}

export interface ObjectProcessingNodeOptions extends ProcessingNodeOptions {
    /**
     * Object filter to specify what data object are processed by this node
     */
    objectFilter?: (object: DataObject, frame?: DataFrame) => boolean;
}
