import { DataFrame } from '../data/DataFrame';
import { DataObject } from '../data';
import { v4 as uuidv4 } from 'uuid';
import { Node, NodeOptions } from '../Node';
import { PushCompletedEvent } from '../graph/events';
import { PushOptions } from '../graph/options';
import { DataObjectService } from '../service';

/**
 * Sink node
 *
 * ## Usage
 *
 * ### Creating a SinkNode
 * When creating a sink node, you have to implement an ```onPush``` method that provides you with the pushed data frame.
 * Sink nodes are the final nodes in the model and have no outlets. Once the onPush is resolved, data objects in that frame
 * are stored in a [[DataObjectService]].
 * ```typescript
 * import { DataFrame, SinkNode } from '@openhps/core';
 *
 * export class CustomSink<In extends DataFrame> extends SinkNode<In> {
 *     // ...
 *     public onPush(data: In, options?: GraphOptions): Promise<void> {
 *         return new Promise<void>((resolve, reject) => {
 *
 *         });
 *     }
 * }
 * ```
 *
 * @category Sink node
 */
export abstract class SinkNode<In extends DataFrame = DataFrame> extends Node<In, In> {
    protected options: SinkNodeOptions;

    constructor(options?: SinkNodeOptions) {
        super(options);

        this.options.completedEvent = this.options['completedEvent'] === undefined ? true : this.options.completedEvent;
        this.options.persistence = this.options['persistence'] === undefined ? true : this.options.persistence;
    }

    public push(data: In | In[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (data === null || data === undefined) {
                return reject();
            }

            // Push the frame to the sink node
            this.onPush(data, options)
                .then(() => {
                    const persistPromise: Array<Promise<void>> = [];
                    if (data instanceof Array) {
                        data.forEach((f: In) => {
                            if (this.options.persistence) {
                                persistPromise.push(this.persistDataObject(f));
                            }
                        });
                    } else {
                        if (this.options.persistence) {
                            persistPromise.push(this.persistDataObject(data));
                        }
                    }
                    return Promise.all(persistPromise);
                })
                .then(() => {
                    resolve();
                    // Fire a completed event
                    if (this.options.completedEvent) {
                        if (data instanceof Array) {
                            data.forEach((f: In) => {
                                this.emit('completed', new PushCompletedEvent(f.uid));
                            });
                        } else {
                            this.emit('completed', new PushCompletedEvent(data.uid));
                        }
                    }
                })
                .catch(reject);
        });
    }

    protected persistDataObject(frame: In): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const servicePromises: Array<Promise<DataObject>> = [];

            const objects: DataObject[] = frame.getObjects();
            for (const object of objects) {
                if (object.uid === null) {
                    object.uid = uuidv4();
                }

                // Queue the storage of the object in a data service
                const service = this.model.findDataService(object) as DataObjectService<DataObject>;
                servicePromises.push(service.insert(object.uid, object));
            }

            Promise.all(servicePromises)
                .then(() => resolve())
                .catch(reject);
        });
    }

    public abstract onPush(frame: In | In[], options?: PushOptions): Promise<void>;
}

export interface SinkNodeOptions extends NodeOptions {
    /**
     * Store objects in data services
     *
     * @default true
     */
    persistence?: boolean;
    /**
     * Emit a completed event for this sink
     *
     * @default true
     */
    completedEvent?: boolean;
}
