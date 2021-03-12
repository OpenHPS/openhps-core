import { DataFrame } from '../data/DataFrame';
import { DataObject } from '../data';
import { Node, NodeOptions } from '../Node';
import { GraphOptions, PullOptions, PushOptions } from '../graph';

/**
 * Source node
 *
 * ## Usage
 *
 * ### Creating a SourceNode
 * When creating a source node, you have to implement a promise based ```onPull``` method that expects a data
 * frame.
 *
 * As mentioned in the [[Node]] class, pulling normally does not require you to return
 * a data frame. The source node implementation provides an abstraction on top of this. If your source node can generate
 * data frames, you can resolve to a data frame. The data frame will then be pushed to outgoing nodes.
 * If not, you can simply resolve nothing or a null object.
 *
 * On top of this abstraction, a source node adds an intermediate output node that merges data objects from the [data service](#dataservice).
 * This way, the data frame pushed by the source will always be up-to-date and merged with existing processed information.
 *
 * ```typescript
 * import { DataFrame, SourceNode } from '@openhps/core';
 *
 * export class CustomSource<Out extends DataFrame> extends SourceNode<Out> {
 *     // ...
 *     constructor() {
 *         // Source nodes expect a source object to be provided
 *         super(new DataObject("mobile_input")));
 *     }
 *
 *     public onPull(options?: GraphPullOptions): Promise<Out> {
 *         return new Promise<Out>((resolve, reject) => {
 *             // ... pull request
 *             // ... get data from somewhere
 *
 *             const dataFrame = new DataFrame(this.getSource());
 *             resolve(dataFrame);
 *         });
 *     }
 * }
 * ```
 *
 * @category Source node
 */
export abstract class SourceNode<Out extends DataFrame = DataFrame> extends Node<Out, Out> {
    protected options: SourceNodeOptions;

    /**
     * Construct a new source node
     *
     * @param {SourceNodeOptions} [options=undefined] Source node options
     */
    constructor(options?: SourceNodeOptions) {
        super(options);

        // Default source settings
        this.options.persistence = this.options['persistence'] === undefined ? true : this.options.persistence;

        this.on('push', this._onPush.bind(this));
        this.on('pull', this._onPull.bind(this));

        if (this.source) {
            this.once('build', this._initRegisterService.bind(this));
        }
    }

    /**
     * Get the source data object
     *
     * @returns {DataObject} Source data object
     */
    protected get source(): DataObject {
        return this.options.source;
    }

    private _initRegisterService(): Promise<void> {
        return new Promise<void>((resolve) => {
            const service = this.model.findDataService(this.source);
            // Update source when modified
            service.on('insert', (uid: string, object: DataObject) => {
                if (uid === this.source.uid) {
                    this.options.source = object;
                }
            });

            // Update to the latest version
            service
                .findByUID(this.source.uid)
                .then((object: DataObject) => {
                    this.options.source = object;
                    resolve();
                })
                .catch(() => {
                    // Ignore, most likely not calibrated or stored yet
                    resolve();
                });
        });
    }

    private _onPush(data: Out | Out[], options?: PushOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const servicePromises: Array<Promise<DataFrame>> = [];

            if (this.options.persistence) {
                if (data instanceof Array) {
                    for (const f of data) {
                        servicePromises.push(this.mergeFrame(f));
                    }
                } else {
                    servicePromises.push(this.mergeFrame(data));
                }
            }

            Promise.all(servicePromises)
                .then(() => {
                    this.outlets.map((outlet) => outlet.push(data, options));
                    resolve();
                })
                .catch(reject);
        });
    }

    protected mergeFrame(frame: DataFrame): Promise<DataFrame> {
        return new Promise<DataFrame>((resolve, reject) => {
            const defaultService = this.model.findDataService(DataObject);
            const promises: Array<Promise<void>> = [];
            const objects: DataObject[] = [];
            frame.getObjects().forEach((object) => {
                objects.push(object);
            });
            objects.forEach((object) => {
                promises.push(
                    new Promise((objResolve) => {
                        let service = this.model.findDataService(object);
                        if (service === null || service === undefined) {
                            service = defaultService;
                        }
                        service
                            .findByUID(object.uid)
                            .then((existingObject: DataObject) => {
                                if (existingObject === null) {
                                    objResolve();
                                }

                                this.mergeObject(object, existingObject);
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

    /**
     * Merge an object
     *
     * @param {DataObject} newObject New object
     * @param {DataObject} oldObject Existing object
     * @returns {DataObject} Existing object
     */
    protected mergeObject(newObject: DataObject, oldObject: DataObject): DataObject {
        newObject.displayName = newObject.displayName || oldObject.displayName;
        newObject.position = newObject.position || oldObject.position;
        newObject.parentUID = newObject.parentUID || oldObject.parentUID;
        oldObject.relativePositions.forEach((relativePosition) => {
            // Get the new relative position by its uid and type
            const newPosition = newObject.getRelativePosition(
                relativePosition.referenceObjectUID,
                relativePosition.constructor.name,
            );

            if (newPosition && newPosition.timestamp < relativePosition.timestamp) {
                // New object contains older relative position
                newObject.addRelativePosition(relativePosition);
            } else if (!newPosition) {
                // New object does not contain stored relative position
                newObject.addRelativePosition(relativePosition);
            }
        });
        return newObject;
    }

    private _onPull(options: PullOptions = {}): Promise<void> {
        if (options.sourceNode && options.sourceNode !== this.uid) {
            // Pull options indicate the pull on a specific source node
            return Promise.resolve();
        }

        const sequential = options['sequentialPull'] === undefined ? true : options.sequentialPull;
        if (sequential) {
            return this._onSequentialPull(options);
        } else {
            return this._onParallelPull(options);
        }
    }

    private _onSequentialPull(options: PullOptions): Promise<void> {
        const newOptions: PushOptions = {
            sourceNode: this.uid,
            // Expand options after setting source node
            // original source node should not be overridden
            ...(options as GraphOptions),
        };
        const count = options.count || 1;

        let promise = Promise.resolve();
        for (let i = 0; i < count; i++) {
            promise = promise.then(
                () =>
                    new Promise((resolve, reject) => {
                        this.onPull(options)
                            .then((frame) => {
                                if (frame !== undefined && frame !== null) {
                                    // Resolve after push is done
                                    return this.push(frame, newOptions);
                                } else {
                                    resolve();
                                }
                            })
                            .then(resolve)
                            .catch(reject);
                    }),
            );
        }
        return promise;
    }

    private _onParallelPull(options: PullOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const newOptions: PushOptions = {
                sourceNode: this.uid,
                // Expand options after setting source node
                // original source node should not be overridden
                ...(options as GraphOptions),
            };
            const count = options.count || 1;

            Promise.all([...Array(count).keys()].map(() => this.onPull(options)))
                .then((results) => {
                    const pushPromises: Array<Promise<void>> = [];
                    results.forEach((frame) => {
                        if (frame !== undefined && frame !== null) {
                            // Push without waiting
                            pushPromises.push(this.push(frame, newOptions));
                        }
                    });
                    return Promise.all(pushPromises);
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    public abstract onPull(options?: PullOptions): Promise<Out>;
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

export interface SensorSourceOptions extends SourceNodeOptions {
    /**
     * Push interval
     */
    interval?: number;
    /**
     * Auto start the sensor
     */
    autoStart?: boolean;
}
