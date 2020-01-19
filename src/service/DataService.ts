import { Service } from "./Service";

/**
 * Data service
 */
export abstract class DataService<T> extends Service {
    private _dataType: new () => T;

    constructor(type: new () => T) {
        super(type.name);
        this._dataType = type;
    }

    public getDataType(): new () => T {
        return this._dataType;
    }

    public abstract findById(id: any): Promise<T>;

    public abstract findAll(): Promise<T[]>;

    public abstract insert(object: T): Promise<T>;

    public abstract update(object: T): Promise<T>;

    public abstract delete(id: any): Promise<void>;

    public abstract deleteAll(): Promise<void>;

}
