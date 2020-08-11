import { DataFrame } from "../data";
import { DataService } from "./DataService";
import { FilterQuery } from "./FilterQuery";

export class DataFrameService<T extends DataFrame> extends DataService<string, DataFrame> {
    private _dataService: DataService<string, T>;

    constructor(dataService: DataService<string, T>, dataType: new () => T | DataFrame = DataFrame) {
        super(dataType as new () => T);
        this._dataService = dataService;
    }

    public findByDataObjectUID(uid: string): Promise<T[]> {
        return this.findAll({});
    }

    public findBefore(timestamp: number): Promise<T[]> {
        const filter: FilterQuery<any> = {
            createdTimestamp: { $lte: timestamp }
        };
        return this.findAll(filter);
    }

    public findAfter(timestamp: number): Promise<T[]> {
        const filter: FilterQuery<any> = {
            createdTimestamp: { $gte: timestamp }
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
