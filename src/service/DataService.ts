import { Service } from "./Service";
import { TypedJSON } from "typedjson";

/**
 * Data service
 */
export abstract class DataService<I, T> extends Service {
    private _dataType: new () => T;
    private _serializer: TypedJSON<T>;

    constructor(type: new () => T) {
        super(type.name);
        this._dataType = type;
        this._serializer = new TypedJSON(type);
    }

    public getDataType(): new () => T {
        return this._dataType;
    }

    public serialize(object: T): any {
        return this._serializer.toPlainJson(object);
    }

    public deserialize(object: any): T {
        return this._serializer.parse(object);
    }

    public abstract findOne(filter: any): Promise<T>;

    public abstract findById(id: I): Promise<T>;

    public abstract findAll(): Promise<T[]>;
    
    public abstract findAll(filter: any): Promise<T[]>;

    public abstract insert(id: I, object: T): Promise<T>;

    public abstract delete(id: I): Promise<void>;

    public abstract deleteAll(): Promise<void>;

}
