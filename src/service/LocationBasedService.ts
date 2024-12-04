import { AbsolutePosition, DataObject } from '../data';
import { Graph } from '../graph/Graph';
import { Model } from '../Model';
import { TimeUnit } from '../utils';
import { DataObjectService } from './DataObjectService';
import { Service } from './Service';
import { TimeService } from './TimeService';
import { Constructor } from '../data/decorators';

/**
 * Location-Based Service
 *
 * ## Usage
 *
 * ### Creation
 * ```typescript
 * const service = new LocationBasedService<
 *  DataObject,
 *  GeographicalPosition
 * >();
 *
 * ModelBuilder.create()
 *  .addService(service)
 *  .from()
 *  .to().build();
 * ```
 *
 * ### Getting the current position
 *
 * ### Setting the current position
 *
 * ### Watching the position of an object
 */
export class LocationBasedService<
    T extends DataObject = DataObject,
    P extends AbsolutePosition = AbsolutePosition,
> extends Service {
    protected options: LBSOptions;
    model: Model;
    protected service: DataObjectService<T>;
    protected watchers: Map<number, Watcher> = new Map();
    protected watchedObjects: Map<string, number[]> = new Map();
    protected watchIndex = 1;

    constructor(options?: LBSOptions) {
        super();
        this.options = options || {};

        this.addDependency(TimeService);
        this.once('build', this._initLBS.bind(this));
        this.once('destroy', this._destroy.bind(this));
    }

    private _initLBS(): void {
        // Default options
        this.options.pullNode = this.options.pullNode || (this.model as Graph<any, any>).internalSink.uid;
        this.options.dataService = this.options.dataService || DataObject;

        this.service = this.model.findDataService(this.options.dataService);
        this.service.on('insert', (uid: string, storedObject: T) => {
            const watchIds = this.watchedObjects.get(uid);
            if (watchIds) {
                const position = storedObject.position as P;
                watchIds.forEach((watchId) => {
                    const watcher = this.watchers.get(watchId);
                    if (position) {
                        watcher.callback(position);
                    }
                });
            }
        });
    }

    private _destroy(): void {
        Array.from(this.watchers.keys()).forEach((watcher) => {
            this.clearWatch(watcher);
        });
    }

    /**
     * Set the current position of an object
     * @param {DataObject | string} object Data object to get the current position of or uid
     * @param {AbsolutePosition} position Position to update
     * @returns {Promise<void>} Promise of updating
     */
    setCurrentPosition(object: T | string, position: P): Promise<void> {
        return new Promise((resolve, reject) => {
            const uid = object instanceof DataObject ? object.uid : object;
            this.service
                .findByUID(uid)
                .then((storedObj) => {
                    storedObj.setPosition(position);
                    return this.service.insertObject(storedObj);
                })
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Get the current position of a specific data object.
     * @param {DataObject | string} object Data object to get the current position of or uid
     * @param {GeoOptions} [options] Current position options
     * @returns {Promise<AbsolutePosition>} Promise of latest absolute position
     */
    getCurrentPosition(object: T | string, options: GeoOptions = {}): Promise<P> {
        return new Promise((resolve, reject) => {
            const maximumAge = options.maximumAge || Infinity;
            options.timeout = options.timeout || 10000;
            const uid = object instanceof DataObject ? object.uid : object;
            // Force update
            if (options.forceUpdate) {
                this.model.findNodeByUID(this.options.pullNode).pull({
                    requestedObjects: [uid],
                });
                const timeout = setTimeout(() => {
                    this.clearWatch(watchId);
                    reject(new Error('Timeout error for getting current position!'));
                }, options.timeout);
                const watchId = this.watchPosition(
                    object,
                    (pos, err) => {
                        this.clearWatch(watchId);
                        clearTimeout(timeout);
                        if (err) {
                            return reject(err);
                        }
                        resolve(pos);
                    },
                    {
                        ...options,
                        interval: -1,
                        forceUpdate: false,
                    },
                );
            } else {
                this.service
                    .findByUID(uid)
                    .then((storedObj) => {
                        const position = storedObj.position;
                        const time = TimeService.getUnit().convert(TimeService.now(), TimeUnit.MILLISECOND);
                        if (position && position.timestamp >= time - maximumAge) {
                            // Stored position satisfies maximum age
                            resolve(position as P);
                        } else {
                            return this.getCurrentPosition(object, {
                                ...options,
                                forceUpdate: true,
                            });
                        }
                    })
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    /**
     * Watch for position changes
     * @param {DataObject | string} object Data object to watch for position changes for
     * @param {(position: AbsolutePosition, err?: Error) => void} callback Callback function
     * @param {GeoWatchOptions} [options] Watch options
     * @returns {number} Watch number
     */
    watchPosition(
        object: T | string,
        callback: (position: P, err?: Error) => void,
        options: GeoWatchOptions = {},
    ): number {
        const uid = object instanceof DataObject ? object.uid : object;
        const watchId = this.watchIndex++;
        const interval = options.interval ?? 1000;
        const timer =
            interval !== -1
                ? (setInterval(() => {
                      this.getCurrentPosition(object, options)
                          .then(callback)
                          .catch((ex) => {
                              callback(undefined, ex);
                          });
                  }, interval) as unknown as number)
                : undefined;
        this.watchers.set(watchId, {
            timer,
            uid,
            callback,
        });
        this.watchObject(uid, watchId);
        return watchId;
    }

    protected watchObject(uid: string, watchId: number): void {
        const existingIds = this.watchedObjects.get(uid) ?? [];
        existingIds.push(watchId);
        this.watchedObjects.set(uid, existingIds);
    }

    protected unwatchObject(uid: string, watchId: number): void {
        const existingIds = this.watchedObjects.get(uid) ?? [];
        existingIds.splice(existingIds.indexOf(watchId), 1);
        if (existingIds.length === 0) {
            this.watchedObjects.delete(uid);
        } else {
            this.watchedObjects.set(uid, existingIds);
        }
    }

    /**
     * Clear a running position watch
     * @param {number} watchId Watch identifier
     */
    clearWatch(watchId: number): void {
        const watcher = this.watchers.get(watchId);
        if (watcher.timer !== undefined) {
            clearInterval(watcher.timer);
        }
        this.watchers.delete(watchId);
        this.unwatchObject(watcher.uid, watchId);
    }
}

interface Watcher {
    timer: number;
    uid: string;
    callback: (pos: AbsolutePosition, err?: Error) => void;
}

interface GeoOptions {
    timeout?: number;
    /**
     * Maximum age in milliseconds for the position. If the stored position
     * is older, a new position update will be attemped.
     */
    maximumAge?: number;
    /**
     * Force update of the position
     */
    forceUpdate?: boolean;
}

interface GeoWatchOptions extends GeoOptions {
    /**
     * Refresh interval in milliseconds
     * @default 1000
     */
    interval?: number;
}

export interface LBSOptions {
    /**
     * Node to pull for pull-based position updates
     * @default internalOutput
     */
    pullNode?: string;
    /**
     * Dataservice to fetch stored data objects
     */
    dataService?: Constructor<DataObject>;
}
