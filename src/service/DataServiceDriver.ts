import { Service, ServiceOptions } from './Service';
import { FilterQuery } from './FilterQuery';
import { FindOptions } from './FindOptions';
import { DataSerializer } from '../data/DataSerializer';
import { Constructor, SerializableChangelog, SerializableMember, SerializableObject } from '../data/decorators';

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
        this.options.keepChangelog = this.options.keepChangelog === undefined ? true : this.options.keepChangelog;

        if (dataType) {
            this.uid = dataType.name;
            this.dataType = dataType;
        }
    }

    abstract findByUID(id: I): Promise<T | (T & SerializableChangelog)>;

    abstract findOne(query?: FilterQuery<T>, options?: FindOptions): Promise<T | (T & SerializableChangelog)>;

    abstract findAll(query?: FilterQuery<T>, options?: FindOptions): Promise<(T | (T & SerializableChangelog))[]>;

    abstract count(query?: FilterQuery<T>): Promise<number>;

    abstract insert(id: I, object: T | (T & SerializableChangelog)): Promise<T | (T & SerializableChangelog)>;

    abstract delete(id: I): Promise<void>;

    abstract deleteAll(query?: FilterQuery<T>): Promise<void>;
}

export interface DataServiceOptions<T = any> extends ServiceOptions {
    serialize?: (obj: T) => any;
    deserialize?: (obj: any) => T;
    /**
     * Keep a changelog of objects returned by the data service
     */
    keepChangelog?: boolean;
}
