import { DataService } from "./DataService";
import { FilterQuery } from "./FilterQuery";

export abstract class DataServiceImpl<I, T> extends DataService<I, T> {
    private _dataService: DataService<I, T>;

    constructor(dataService: DataService<I, T>, dataType: new () => T) {
        super(dataType as new () => T);
        this._dataService = dataService;

        this.once('build', () => this._dataService.emitAsync('build'));
        this.once('destroy', () => this._dataService.emitAsync('destroy'));
    }

    public findByUID(uid: I): Promise<T> {
        return this._dataService.findByUID(uid);
    }

    public findOne(query?: FilterQuery<T>): Promise<T> {
        return this._dataService.findOne(query);
    }

    public findAll(query?: FilterQuery<T>): Promise<T[]> {
        return this._dataService.findAll(query);
    }

    public insert(id: I, object: T): Promise<T> {
        return this._dataService.insert(id, object);
    }

    public delete(id: I): Promise<void> {
        return this._dataService.delete(id);
    }

    public deleteAll(): Promise<void> {
        return this._dataService.deleteAll();
    }

}
