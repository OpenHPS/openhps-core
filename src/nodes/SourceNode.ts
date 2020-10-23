import { DataFrame } from '../data/DataFrame';
import { DataObject } from '../data';
import { AbstractSourceNode } from '../graph/interfaces/AbstractSourceNode';
import { Model } from '../Model';
import { NodeOptions } from '../Node';
import { PullOptions, PushOptions } from '../graph';

/**
 * Source node
 */
export abstract class SourceNode<Out extends DataFrame = DataFrame> extends AbstractSourceNode<Out> {
    /**
     * Source data object responsible for generating data frames
     */
    protected source: DataObject;
    protected options: SourceNodeOptions;
    private _persistence: boolean;

    /**
     * Construct a new source node
     *
     * @param {DataObject} source Source data object
     * @param {Object} [options=undefined] Source node options
     */
    constructor(source?: DataObject, options?: SourceNodeOptions) {
        super(options);
        this.source = source || this.options.source;

        this._persistence = this.options.persistence || true;
        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));
    }

    private _onPush(data: Out | Out[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const servicePromises: Array<Promise<void>> = [];
            const pushPromises: Array<Promise<void>> = [];

            if (this._persistence) {
                if (data instanceof Array) {
                    for (const f of data) {
                        servicePromises.push(this._mergeFrame(f).then((f) => this.persistFrame(f)));
                    }
                } else {
                    servicePromises.push(this._mergeFrame(data).then((f) => this.persistFrame(f)));
                }
            }

            Promise.all(servicePromises)
                .then(() => {
                    this.outputNodes.forEach((node) => {
                        pushPromises.push(node.push(data, options));
                    });
                    return Promise.all(pushPromises);
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    protected persistFrame(f: DataFrame): Promise<void> {
        return new Promise((resolve, reject) => {
            const model = this.graph as Model;

            if (f !== null || f !== undefined) {
                const frameService = model.findDataService(f);

                if (frameService !== null && frameService !== undefined) {
                    // Update the frame
                    frameService
                        .insert(f.uid, f)
                        .then(() => {
                            resolve();
                        })
                        .catch(reject);
                }
            } else {
                // No frame provided in pull
                resolve();
            }
        });
    }

    private _mergeFrame(frame: DataFrame): Promise<DataFrame> {
        return new Promise<DataFrame>((resolve, reject) => {
            const model = this.graph as Model<any, any>;
            const defaultService = model.findDataService(DataObject);
            const promises: Array<Promise<void>> = [];
            const objects: DataObject[] = [];
            frame.getObjects().forEach((object) => {
                objects.push(object);
            });
            objects.forEach((object) => {
                promises.push(
                    new Promise((objResolve) => {
                        let service = model.findDataService(object);
                        if (service === null || service === undefined) {
                            service = defaultService;
                        }
                        service
                            .findByUID(object.uid)
                            .then((existingObject: DataObject) => {
                                if (existingObject === null) {
                                    objResolve();
                                }

                                object.merge(existingObject);
                                objResolve();
                            })
                            .catch(() => {
                                // Ignore
                                objResolve();
                            });
                    }),
                );
            });

            Promise.all(promises)
                .then(() => {
                    resolve(frame);
                })
                .catch(reject);
        });
    }

    private _onPull(options?: PullOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.onPull()
                .then((frame) => {
                    if (frame !== undefined && frame !== null) {
                        return this.push(frame, options);
                    } else {
                        resolve();
                    }
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    public abstract onPull(): Promise<Out>;
}

export interface SourceNodeOptions extends NodeOptions {
    /**
     * Merge objects from persisted source
     *
     * @default true
     */
    persistence?: boolean;
    /**
     * Source data object
     */
    source?: DataObject;
}
