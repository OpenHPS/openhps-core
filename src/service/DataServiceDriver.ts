import { Service } from './Service';
import { FilterQuery } from './FilterQuery';
import { FindOptions } from './FindOptions';
import { DataSerializer } from '../data/DataSerializer';

/**
 * DataService driver for storing and querying data objects
 * of a specific data type using a certain implementation.
 */
export abstract class DataServiceDriver<I, T> extends Service {
    public dataType: new () => T;
    protected options: DataServiceOptions<T>;

    constructor(dataType: new () => T, options: DataServiceOptions<T> = {}) {
        super();

        this.options = options;
        this.options.serialize = this.options.serialize || ((obj) => DataSerializer.serialize(obj));
        this.options.deserialize = this.options.deserialize || ((obj) => DataSerializer.deserialize(obj));

        if (dataType) {
            this.uid = dataType.name;
            this.dataType = dataType;
        }
    }

    public abstract findByUID(id: I): Promise<T>;

    public abstract findOne(query?: FilterQuery<T>, options?: FindOptions): Promise<T>;

    public abstract findAll(query?: FilterQuery<T>, options?: FindOptions): Promise<T[]>;

    public abstract count(query?: FilterQuery<T>): Promise<number>;

    public abstract insert(id: I, object: T): Promise<T>;

    public abstract delete(id: I): Promise<void>;

    public abstract deleteAll(query?: FilterQuery<T>): Promise<void>;
}

export interface DataServiceOptions<T = any> {
    serialize?: (obj: T) => any;
    deserialize?: (obj: any) => T;
}
