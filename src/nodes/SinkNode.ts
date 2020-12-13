import { DataFrame } from '../data/DataFrame';
import { DataObject } from '../data';
import { v4 as uuidv4 } from 'uuid';
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
}
