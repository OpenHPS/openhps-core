import { DataService } from "./DataService";
import { DataObject, AbsolutePosition, Absolute2DPosition } from "../data";
import { FilterQuery } from "./FilterQuery";
import { Vector3 } from "../utils";

/**
 * The object service manages the data of objects that are currently being
 * processed in the model and objects that need to be tracked.
 */
export class DataObjectService<T extends DataObject> extends DataService<string, DataObject> {
    private _dataService: DataService<string, T>;

    constructor(dataService: DataService<string, T>, dataType: new () => T | DataObject = DataObject) {
        super(dataType as new () => T);
        this._dataService = dataService;
    }

    /**
     * Find a data object by its display name
     * @param displayName Name to search for
     */
    public findByDisplayName(displayName: string): Promise<T[]> {
        const filter: FilterQuery<any> = {
            displayName
        };
        return this.findAll(filter);
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
        return this.findAll(filter);
    }

    /**
     * Find all data objects with a parent UID
     * @param parentUID Parent UID
     */
    public findByParentUID(parentUID: string): Promise<T[]> {
        const filter: FilterQuery<any> = {
            parentUID
        };
        return this.findAll(filter);
    }

    public findByUID(uid: string): Promise<T> {
        return this._dataService.findByUID(uid);
    }

    public findOne(query?: FilterQuery<T>): Promise<T> {
        return this._dataService.findOne(query);
    }

    public findAll(query?: FilterQuery<T>): Promise<T[]> {
        return this._dataService.findAll(query);
    }

    public insert(id: string, object: T): Promise<T> {
        return this._dataService.insert(id, object);
    }

    public delete(id: string): Promise<void> {
        return this._dataService.delete(id);
    }

    public deleteAll(): Promise<void> {
        return this._dataService.deleteAll();
    }

}
