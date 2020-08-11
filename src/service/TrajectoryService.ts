import { DataService } from "./DataService";
import { DataObject, AbsolutePosition } from "../data";
import { FilterQuery } from "./FilterQuery";

export abstract class TrajectoryService<T extends DataObject> extends DataService<string, DataObject> {
    private _dataService: DataService<string, T>;

    constructor(dataService: DataService<string, T>, dataType: new () => T | DataObject = DataObject) {
        super(dataType as new () => T);
        this._dataService = dataService;
    }

    public abstract findPosition(uid: string): Promise<AbsolutePosition>;

    public abstract findTrajectory(uid: string, start?: Date, end?: Date): Promise<AbsolutePosition[]>;
    
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
