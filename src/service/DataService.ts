import { Location } from "../data/location";

/**
 * # OpenHPS: Data Service
 */
export abstract class DataService<T> {
    private _typeName: string;

    constructor() {
    }

    /**
     * Find an object by its identifier
     * @param id Object identifier
     */
    public abstract findById(id: any): Promise<T>;

    /**
     * Find all objects
     */
    public abstract findAll(): Promise<T[]>;

    /**
     * Track a new object
     * @param object Object to track
     */
    public abstract create(object: T): Promise<T>;

    public abstract update(object: T): Promise<T>;

    public abstract delete(object: T): Promise<void>;

    public setType<K>(type: new () => K) {
        this._typeName = type.name;
    }

    /**
     * Get data manager type name
     */
    public getTypeName() {
        return this._typeName;
    }
}
