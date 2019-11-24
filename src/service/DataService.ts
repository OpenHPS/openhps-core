import { Service } from "./Service";

/**
 * # OpenHPS: Data service
 */
export abstract class DataService<T> extends Service {

    constructor(type: new () => T) {
        super(type.name);
    }

    public abstract findById(id: any): Promise<T>;

    public abstract findAll(): Promise<T[]>;

    public abstract create(object: T): Promise<T>;

    public abstract update(object: T): Promise<T>;

    public abstract delete(id: any): Promise<void>;

    public abstract deleteAll(): Promise<void>;

}
