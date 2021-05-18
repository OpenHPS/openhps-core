import { DataObject, AbsolutePosition, Absolute3DPosition } from '../data';
import { FilterQuery } from './FilterQuery';
import { Vector3 } from '../utils';
import { DataService } from './DataService';
import { DataServiceDriver } from './DataServiceDriver';

/**
 * The object service manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class DataObjectService<T extends DataObject> extends DataService<string, T> {
    constructor(dataServiceDriver?: DataServiceDriver<string, T>) {
        super(dataServiceDriver);
    }

    /**
     * Insert a new data object
     *
     * @param {DataObject} object Data object to insert
     * @returns {DataObject} Inserted object
     */
    public insertObject(object: T): Promise<T> {
        return this.insert(object.uid, object);
    }

    public insert(id: string, object: T): Promise<T> {
        return new Promise((resolve, reject) => {
            this.driver
                .insert(id, object)
                .then((obj) => {
                    resolve(obj);
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
        return this.findAll({
            displayName,
        }) as Promise<T[]>;
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
        if (position instanceof Absolute3DPosition) {
            filter = {
                'position.x': vector.x,
                'position.y': vector.y,
                'position.z': vector.z,
            };
        } else {
            filter = {
                'position.x': vector.x,
                'position.y': vector.y,
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
        return this.findAll({
            parentUID,
        }) as Promise<T[]>;
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
        return this.findAll({
            createdTimestamp: timestampFilter,
        }) as Promise<T[]>;
    }
}
