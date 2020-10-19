import { DataFrame } from '../data/DataFrame';
import { Model } from '../Model';
import { DataObject } from '../data';
import { v4 as uuidv4 } from 'uuid';
import { AbstractSinkNode } from '../graph/interfaces/AbstractSinkNode';
import { DataService } from '../service';
import { NodeOptions } from '../Node';
import { PushOptions } from '../graph';

/**
 * Sink node
 */
export abstract class SinkNode<In extends DataFrame = DataFrame> extends AbstractSinkNode<In> {
    protected options: SinkNodeOptions;

    constructor(options?: SinkNodeOptions) {
        super(options);

        this.options.persistence = this.options['persistence'] === undefined ? true : this.options.persistence;
        this.options.removeFrames = this.options['removeFrames'] === undefined ? true : this.options.removeFrames;
    }

    public push(frame: In | In[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (frame === null || frame === undefined) {
                this.logger('warning', {
                    node: { uid: this.uid, name: this.name },
                    message: `Sink node received null data frame!`,
                });
                return reject();
            }

            // Push the frame to the sink node
            this.onPush(frame)
                .then(() => {
                    const persistPromise: Array<Promise<void>> = [];
                    if (frame instanceof Array) {
                        frame.forEach((f: In) => {
                            if (this.options.removeFrames) {
                                persistPromise.push(this.removeDataFrame(f));
                            }
                            if (this.options.persistence) {
                                persistPromise.push(this.persistDataObject(f));
                            }
                        });
                    } else {
                        if (this.options.removeFrames) {
                            persistPromise.push(this.removeDataFrame(frame));
                        }
                        if (this.options.persistence) {
                            persistPromise.push(this.persistDataObject(frame));
                        }
                    }
                    return Promise.all(persistPromise);
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    protected removeDataFrame(frame: In): Promise<void> {
        return new Promise<void>((resolve) => {
            const model: Model<any, any> = this.graph as Model<any, any>;
            const servicePromises: Array<Promise<void>> = [];

            // Remove the frame from the data frame service
            const frameService: DataService<any, any> = model.findDataService(frame);
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
            const model: Model<any, any> = this.graph as Model<any, any>;
            const servicePromises: Array<Promise<DataObject>> = [];

            const objects: DataObject[] = [];
            frame.getObjects().forEach((object) => {
                objects.push(object);
            });

            for (const object of objects) {
                if (object.uid === null) {
                    object.uid = uuidv4();
                }
                // Queue the storage of the object in a data service
                servicePromises.push(model.findDataService(object).insert(object.uid, object));
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
