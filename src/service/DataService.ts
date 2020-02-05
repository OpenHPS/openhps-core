import { Service } from "./Service";

/**
 * Data service
 */
export abstract class DataService<I, T> extends Service {
    private _dataType: new () => T;

    constructor(type: new () => T) {
        super(type.name);
        this._dataType = type;
    }

    public getDataType(): new () => T {
        return this._dataType;
    }

    public abstract findOne(filter: any): Promise<T>;

    public abstract findById(id: I): Promise<T>;

    public abstract findAll(): Promise<T[]>;
    
    public abstract findAll(filter: any): Promise<T[]>;

    public abstract insert(id: I, object: T): Promise<T>;

    public abstract delete(id: I): Promise<void>;

    public abstract deleteAll(): Promise<void>;

}
