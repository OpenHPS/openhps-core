import { DataFrame } from '../data/DataFrame';
import { DataObject } from '../data';
import { v4 as uuidv4 } from 'uuid';
import { DataService } from '../service';
import { Node, NodeOptions } from '../Node';
import { PushOptions } from '../graph';

/**
 * Sink node
 */
export abstract class SinkNode<In extends DataFrame = DataFrame> extends Node<In, In> {
    protected options: SinkNodeOptions;

    constructor(options?: SinkNodeOptions) {
        super(options);

        this.options.persistence = this.options['persistence'] === undefined ? true : this.options.persistence;
        this.options.removeFrames = this.options['removeFrames'] === undefined ? true : this.options.removeFrames;
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
                            if (this.options.removeFrames) {
                                persistPromise.push(this.removeDataFrame(f));
                            }
                            if (this.options.persistence) {
                                persistPromise.push(this.persistDataObject(f));
                            }
                        });
                    } else {
                        if (this.options.removeFrames) {
                            persistPromise.push(this.removeDataFrame(data));
                        }
                        if (this.options.persistence) {
                            persistPromise.push(this.persistDataObject(data));
                        }
                    }
                    return Promise.all(persistPromise);
                })
                .then(() => {
                    resolve();
                    // Fire a completed event
                    if (data instanceof Array) {
                        data.forEach((f: In) => {
                            this.emit('completed', {
                                frameUID: f.uid,
                            });
                        });
                    } else {
                        this.emit('completed', {
                            frameUID: data.uid,
                        });
                    }
                })
                .catch(reject);
        });
    }

    protected removeDataFrame(frame: In): Promise<void> {
        return new Promise<void>((resolve) => {
            const servicePromises: Array<Promise<void>> = [];

            // Remove the frame from the data frame service
            const frameService: DataService<any, any> = this.model.findDataService(frame);
            if (frameService !== null && frameService !== undefined) {
                // Update the frame
                servicePromises.push(frameService.delete(frame.uid));
            }

            Promise.all(servicePromises)
                .then(() => {
                    resolve();
                })
                .catch(() => {
                    resolve(); // Ignore frame deleting issue
                });
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
                servicePromises.push(this.model.findDataService(object).insert(object.uid, object));
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
     * Remove data frames from services
     *
     * @default true
     */
    removeFrames?: boolean;
}
