import { DataServiceDriver } from "./DataServiceDriver";
import { FilterQuery } from "./FilterQuery";

export abstract class DataService<I, T> extends DataServiceDriver<I, T> {
    private _dataService: DataServiceDriver<I, T>;

    constructor(dataService: DataServiceDriver<I, T>) {
        super(dataService.dataType);
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
