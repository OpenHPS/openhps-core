/**
 * # OpenHPS: Data service
 */
export abstract class DataService<T> {
    private _typeName: string;

    constructor(type: new () => T) {
        this._typeName = type.name;
    }

    public abstract findById(id: any): Promise<T>;

    public abstract findAll(): Promise<T[]>;

    public abstract create(object: T): Promise<T>;

    public abstract update(object: T): Promise<T>;

    public abstract delete(id: any): Promise<void>;

    public abstract deleteAll(): Promise<void>;

    /**
     * Get data manager type name
     */
    public getTypeName() {
        return this._typeName;
    }
}
