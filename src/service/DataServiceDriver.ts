import { Service } from "./Service";
import { FilterQuery } from "./FilterQuery";

/**
 * DataService driver for storing and querying data objects
 * of a specific data type using a certain implementation.
 */
export abstract class DataServiceDriver<I, T> extends Service {
    private _dataType: new () => T;

    constructor(dataType: new () => T, options?: any) {
        super();
        this.name = dataType.name;
        this._dataType = dataType;
    }

    public get dataType(): new () => T {
        return this._dataType;
    }

    public set dataType(dataType: new () => T) {
        this._dataType = dataType;
    }

    public abstract findByUID(id: I): Promise<T>;

    public abstract findOne(query?: FilterQuery<T>): Promise<T>;

    public abstract findAll(query?: FilterQuery<T>): Promise<T[]>;

    public abstract insert(id: I, object: T): Promise<T>;

    public abstract delete(id: I): Promise<void>;

    public abstract deleteAll(query?: FilterQuery<T>): Promise<void>;

}
