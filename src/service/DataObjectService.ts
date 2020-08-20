import { DataObject, AbsolutePosition, Absolute2DPosition } from '../data';
import { FilterQuery } from './FilterQuery';
import { Vector3 } from '../utils';
import { DataService } from './DataService';

/**
 * The object service manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class DataObjectService<T extends DataObject> extends DataService<string, T> {
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
}
