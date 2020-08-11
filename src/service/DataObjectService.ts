import { DataService } from "./DataService";
import { DataObject, AbsolutePosition, Absolute2DPosition } from "../data";
import { FilterQuery } from "./FilterQuery";
import { Vector3 } from "../utils";
import { DataServiceImpl } from "./DataServiceImpl";

/**
 * The object service manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class DataObjectService<T extends DataObject> extends DataServiceImpl<string, DataObject> {

    constructor(dataService: DataService<string, T>, dataType: new () => T | DataObject = DataObject) {
        super(dataService, dataType as new () => T);
    }

    /**
     * Find a data object by its display name
     * @param displayName Name to search for
     */
    public findByDisplayName(displayName: string): Promise<T[]> {
        const filter: FilterQuery<any> = {
            displayName
        };
        return this.findAll(filter) as Promise<T[]>;
    }

    /**
     * Find a data object by its current absolute position
     * @param position Current absolute position
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
     * @param parentUID Parent UID
     */
    public findByParentUID(parentUID: string): Promise<T[]> {
        const filter: FilterQuery<any> = {
            parentUID
        };
        return this.findAll(filter) as Promise<T[]>;
    }

}
