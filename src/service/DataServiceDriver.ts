import { Service } from "./Service";

export abstract class DataServiceDriver<I, T> extends Service {

    protected _data: Map<I, any> = new Map();
    private _dataType: new () => T;

    constructor(dataType: new () => T) {
        super(dataType.name);
        this._dataType = dataType;
    }
    
    public get dataType(): new () => T {
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
