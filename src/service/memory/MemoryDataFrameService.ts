import { DataFrame } from "../../data";
import { DataFrameService } from "../DataFrameService";
import { MemoryDataService } from "./MemoryDataService";

/**
 * Memory data frame service
 *  This service should not be used on a production server
 *  as its quering is not efficient.
 */
export class MemoryDataFrameService<T extends DataFrame> extends DataFrameService<T> {
    private _dataService: MemoryDataService<string, T>;
    
    constructor(dataType: new () => T | DataFrame = DataFrame, options?: any) {
        super(dataType as new () => T, options);
        this._dataService = new MemoryDataService<string, T>(dataType as new () => T, options);
    }

    public findByDataObjectUID(uid: string): Promise<T[]> {
        return this.findAll(frame => frame.getObjectByUID(uid) !== undefined);
    }

    public findBefore(timestamp: number): Promise<T[]> {
        return this.findAll(frame => frame.createdTimestamp <= timestamp);
    }

    public findAfter(timestamp: number): Promise<T[]> {
        return this.findAll(frame => frame.createdTimestamp >= timestamp);
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
