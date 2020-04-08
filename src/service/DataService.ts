import { Service } from "./Service";

export abstract class DataService<I, T> extends Service {
    private _dataType: new () => T;

    constructor(dataType: new () => T, options?: any) {
        super(dataType.name);
        this._dataType = dataType;
    }

    public get dataType(): new () => T {
        return this._dataType;
    }

    public set dataType(dataType: new () => T) {
        this._dataType = dataType;
    }
    
    public abstract findByUID(uid: I): Promise<T>;

    public abstract findAll(): Promise<T[]>;

    public abstract insert(object: T): Promise<T>;

    public abstract delete(id: I): Promise<void>;

    public abstract deleteAll(): Promise<void>;

}
