import { Service } from './Service';
import { FilterQuery } from './FilterQuery';

/**
 * DataService driver for storing and querying data objects
 * of a specific data type using a certain implementation.
 */
export abstract class DataServiceDriver<I, T> extends Service {
    public dataType: new () => T;

    constructor(dataType: new () => T) {
        super();

        if (dataType) {
            this.name = dataType.name;
            this.dataType = dataType;
        }
    }

    public abstract findByUID(id: I): Promise<T>;

    public abstract findOne(query?: FilterQuery<T>): Promise<T>;

    public abstract findAll(query?: FilterQuery<T>): Promise<T[]>;

    public abstract insert(id: I, object: T): Promise<T>;

    public abstract delete(id: I): Promise<void>;

    public abstract deleteAll(query?: FilterQuery<T>): Promise<void>;
}
