import { DataObject, AbsolutePosition, Absolute2DPosition } from '../data';
import { FilterQuery } from './FilterQuery';
import { Vector3 } from '../utils';
import { DataService } from './DataService';
import { DataServiceDriver } from './DataServiceDriver';

/**
 * The object service manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class DataObjectService<T extends DataObject> extends DataService<string, T> {
    constructor(dataServiceDriver: DataServiceDriver<string, T>) {
        super(dataServiceDriver);

        this.driver.once('ready', this._createIndexes.bind(this));
    }

    private _createIndexes(): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.createIndex('uid'),
                this.createIndex('displayName'),
                this.createIndex('parentUID'),
                this.createIndex('position.x'),
                this.createIndex('position.y'),
                this.createIndex('position.z'),
                this.createIndex('createdTimestamp'),
            ])
                .then(() => {
                    resolve();
                })
                .catch(reject);
        });
    }

    /**
     * Find a data object by its display name
     *
     * @param {string} displayName Name to search for
     * @returns {DataObject[]} Array of data objects that match the display name
     */
    public findByDisplayName(displayName: string): Promise<T[]> {
        const filter: FilterQuery<any> = {
            displayName,
        };
        return this.findAll(filter) as Promise<T[]>;
    }

    /**
     * Find a data object by its current absolute position
     *
     * @param {AbsolutePosition} position Current absolute position
     * @returns {DataObject[]} Array of data objects that match the position
     */
    public findByPosition(position: AbsolutePosition): Promise<T[]> {
        const vector: Vector3 = position.toVector3();
        let filter: FilterQuery<any>;
        if (position instanceof Absolute2DPosition) {
            filter = {
                'position.x': vector.x,
                'position.y': vector.y,
            };
        } else {
            filter = {
                'position.x': vector.x,
                'position.y': vector.y,
                'position.z': vector.z,
            };
        }
        return this.findAll(filter) as Promise<T[]>;
    }

    /**
     * Find all data objects with a parent UID
     *
     * @param {string} parentUID string Parent UID
     * @returns {DataObject[]} Array of data objects that match the parent UID
     */
    public findByParentUID(parentUID: string): Promise<T[]> {
        const filter: FilterQuery<any> = {
            parentUID,
        };
        return this.findAll(filter) as Promise<T[]>;
    }

    /**
     * Find data objects created before a certain timestamp
     *
     * @param {number} timestamp Timestamp
     * @returns {DataObject[]} Array of data objects before the specified timestamp
     */
    public findBefore(timestamp: number): Promise<T[]> {
        return this._findTimestamp({ $lte: timestamp });
    }

    /**
     * Find data objects created after a certain timestamp
     *
     * @param {number} timestamp Timestamp
     * @returns {DataObject[]} Array of data objects after the specified timestamp
     */
    public findAfter(timestamp: number): Promise<T[]> {
        return this._findTimestamp({ $gte: timestamp });
    }

    private _findTimestamp(timestampFilter: any): Promise<T[]> {
        const filter: FilterQuery<any> = {
            createdTimestamp: timestampFilter,
        };
        return this.findAll(filter) as Promise<T[]>;
    }
}
