import { DataObject, AbsolutePosition } from "../../data";
import { DataObjectService } from "../DataObjectService";
import { MemoryDataService } from "./MemoryDataService";

/**
 * Memory data object service
 *  This service should not be used on a production server
 *  as its quering is not efficient.
 */
export class MemoryDataObjectService<T extends DataObject> extends DataObjectService<T> {
    private _dataService: MemoryDataService<string, T>;

    constructor(dataType: new () => T | DataObject = DataObject, options?: any) {
        super(dataType as new () => T, options);
        this._dataService = new MemoryDataService<string, T>(dataType as new () => T, options);
    }

    public findByDisplayName(displayName: string): Promise<T[]> {
        return this.findAll((object: T) => object.displayName === displayName);
    }

    public findByPosition(position: AbsolutePosition): Promise<T[]> {
        return this.findAll((object: T) => object.getPosition().equals(position));
    }

    public findByParentUID(parentUID: string): Promise<T[]> {
        return this.findAll((object: T) => object.parentUID === parentUID);
    }

    public findByUID(uid: string): Promise<T> {
        return this._dataService.findByUID(uid);
    }

    public findOne(query: (object: T) => boolean = () => true): Promise<T> {
        return this._dataService.findOne(query);
    }

    public findAll(query: (object: T) => boolean = () => true): Promise<T[]> {
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
