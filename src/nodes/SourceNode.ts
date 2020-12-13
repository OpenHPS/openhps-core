import { DataFrame } from '../data/DataFrame';
import { DataObject } from '../data';
import { Node, NodeOptions } from '../Node';
import { GraphOptions, PullOptions, PushOptions } from '../graph';

/**
 * Source node
 */
export abstract class SourceNode<Out extends DataFrame = DataFrame> extends Node<Out, Out> {
    /**
     * Source data object responsible for generating data frames
     */
    private _source: DataObject;
    protected options: SourceNodeOptions;

    /**
     * Construct a new source node
     *
     * @param {DataObject} [source] Source data object
     * @param {Object} [options=undefined] Source node options
     */
    constructor(source?: DataObject, options?: SourceNodeOptions) {
        super(options);
        this._source = source || this.options.source;

        // Default source settings
        this.options.persistence = this.options.persistence || true;

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
    public get source(): DataObject {
        return this._source;
    }

    private _initRegisterService(): Promise<void> {
        return new Promise<void>((resolve) => {
            const service = this.model.findDataService(this.source);
            // Update source when modified
            service.on('insert', (uid: string, object: DataObject) => {
                if (uid === this.source.uid) {
                    this._source = object;
                }
            });

            // Update to the latest version
            service
                .findByUID(this.source.uid)
                .then((object: DataObject) => {
                    this._source = object;
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
                    this.outlets.forEach((outlet) => outlet.push(data, options));
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
            } else {
                // New object does not contain stored relative position
                newObject.addRelativePosition(relativePosition);
            }
        });
        return newObject;
    }

    private _onPull(options: PullOptions = {}): Promise<void> {
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
                        this.onPull()
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
