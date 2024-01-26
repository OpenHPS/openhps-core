import { Service, ServiceOptions } from './Service';
import { FilterQuery } from './FilterQuery';
import { FindOptions } from './FindOptions';
import { DataSerializer } from '../data/DataSerializer';
import { Constructor, SerializableMember, SerializableObject } from '../data/decorators';

/**
 * DataService driver for storing and querying data objects
 * of a specific data type using a certain implementation.
 */
@SerializableObject()
export abstract class DataServiceDriver<I, T> extends Service {
    @SerializableMember({
        serializer: (dataType) => (dataType ? dataType.name : undefined),
        deserializer: (dataTypeString) => (dataTypeString ? DataSerializer.findTypeByName(dataTypeString) : undefined),
    })
    dataType: Constructor<T>;
    @SerializableMember()
    protected options: DataServiceOptions<T>;

    constructor(dataType: Constructor<T>, options: DataServiceOptions<T> = {}) {
        super();

        this.options = options;
        this.options.serialize = this.options.serialize || ((obj) => DataSerializer.serialize(obj));
        this.options.deserialize = this.options.deserialize || ((obj) => DataSerializer.deserialize(obj));

        if (dataType) {
            this.uid = dataType.name;
            this.dataType = dataType;
        }
    }

    abstract findByUID(id: I): Promise<T>;

    abstract findOne(query?: FilterQuery<T>, options?: FindOptions): Promise<T>;

    abstract findAll(query?: FilterQuery<T>, options?: FindOptions): Promise<T[]>;

    abstract count(query?: FilterQuery<T>): Promise<number>;

    abstract insert(id: I, object: T): Promise<T>;

    abstract delete(id: I): Promise<void>;

    abstract deleteAll(query?: FilterQuery<T>): Promise<void>;
}

export interface DataServiceOptions<T = any> extends ServiceOptions {
    serialize?: (obj: T) => any;
    deserialize?: (obj: any) => T;
}
