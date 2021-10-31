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
 * ### Watching the position of an object
 */
export class LocationBasedService<
    T extends DataObject = DataObject,
    P extends AbsolutePosition = AbsolutePosition,
> extends Service {
    protected options: LBSOptions;
    public model: Model;
    protected service: DataObjectService<T>;
    protected watchers: Map<number, Watcher> = new Map();
    protected watchedObjects: Map<string, number> = new Map();
    protected watchIndex = 1;

    constructor(options?: LBSOptions) {
        super();
        this.options = options || {};
        this.once('build', this._initLBS.bind(this));
    }

    private _initLBS(): void {
        // Default options
        this.options.pullNode = this.options.pullNode || (this.model as Graph<any, any>).internalSink.uid;
        this.options.dataService = this.options.dataService || DataObject;

        this.service = this.model.findDataService(this.options.dataService);
        this.service.on('insert', (uid: string, storedObject: T) => {
            const watchId = this.watchedObjects.get(uid);
            if (watchId) {
                const position = storedObject.position as P;
                const watcher = this.watchers.get(watchId);
                if (position) {
                    watcher.callback(position);
                }
            }
        });
    }

    /**
     * Get the current position of a specific data object.
     *
     * @param {DataObject | string} object Data object to get the current position of or uid
     * @param {GeoOptions} [options] Current position options
     * @returns {Promise<AbsolutePosition>} Promise of latest absolute position
     */
    public getCurrentPosition(object: T | string, options: GeoOptions = {}): Promise<P> {
        return new Promise((resolve, reject) => {
            const maximumAge = options.maximumAge || Infinity;
            options.timeout = options.timeout || 10000;
            const uid = object instanceof DataObject ? object.uid : object;
            this.service
                .findByUID(uid)
                .then((storedObj) => {
                    const position = storedObj.position;
                    const time = TimeService.getUnit().convert(TimeService.now(), TimeUnit.MILLISECOND);
                    if (position && position.timestamp >= time - maximumAge) {
                        // Stored position satisfies maximum age
                        resolve(position as P);
                    } else {
                        const timeout = setTimeout(() => {
                            this.clearWatch(watchId);
                            reject(new Error('Timeout error for getting current position!'));
                        }, options.timeout);
                        this.model.findNodeByUID(this.options.pullNode).pull({
                            requestedObjects: [uid],
                        });
                        const watchId = this.watchPosition(object, (pos, err) => {
                            this.clearWatch(watchId);
                            clearTimeout(timeout);
                            if (err) {
                                return reject(err);
                            }
                            resolve(pos);
                        });
                    }
                })
                .catch(reject);
        });
    }

    public watchPosition(
        object: T | string,
        callback: (position: P, err?: Error) => void,
        options: GeoWatchOptions = {},
    ): number {
        const uid = object instanceof DataObject ? object.uid : object;
        const watchId = this.watchIndex++;
        const timer = options.interval
            ? (setInterval(() => {
                  this.getCurrentPosition(object, options)
                      .then(callback)
                      .catch((ex) => {
                          callback(undefined, ex);
                      });
              }, options.interval) as unknown as number)
            : undefined;
        this.watchers.set(watchId, {
            timer,
            uid,
            callback,
        });
        this.watchedObjects.set(uid, watchId);
        return watchId;
    }

    /**
     * Clear a running position watch
     *
     * @param {number} watchId Watch identifier
     */
    public clearWatch(watchId: number): void {
        const watcher = this.watchers.get(watchId);
        if (watcher.timer) clearInterval(watcher.timer);
        this.watchers.delete(watchId);
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
     *
     * @default 1000
     */
    interval?: number;
}

export interface LBSOptions {
    /**
     * Node to pull for pull-based position updates
     *
     * @default internalOutput
     */
    pullNode?: string;
    /**
     * Dataservice to fetch stored data objects
     */
    dataService?: Constructor<DataObject>;
}
