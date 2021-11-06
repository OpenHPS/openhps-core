import { EventEmitter } from 'events';
import { JsonObjectMetadata, Constructor, Serializable } from 'typedjson';
import type { MappedTypeConverters } from 'typedjson/lib/types/parser';
import { ObjectMetadata } from './decorators/metadata';
import { Deserializer } from './Deserializer';
import { Serializer } from './Serializer';

const META_FIELD = '__typedJsonJsonObjectMetadataInformation__';

/**
 * Allows the serialization and deserialization of objects using the [[SerializableObject]] decorator.
 *
 * ## Usage
 *
 * ### Registration
 * Objects are registered upon loading with the [[SerializableObject]] decorator.
 * Manual registration is possible using:
 * ```typescript
 * DataSerializer.registerType(MyObjectClass);
 * ```
 */
export class DataSerializer {
    protected static readonly knownTypes: Map<string, Serializable<any>> = new Map();
    protected static readonly serializer: Serializer = new Serializer();
    protected static readonly deserializer: Deserializer = new Deserializer();
    /* Event emitter used to listen for registrations and unregister of data types */
    protected static eventEmitter: EventEmitter = new EventEmitter();

    /**
     * Manually register a new type
     *
     * @param {typeof any} type Type to register
     * @param {MappedTypeConverters} [converters] Optional converters
     */
    static registerType<T>(type: Serializable<T>, converters?: MappedTypeConverters<T>): void {
        this.knownTypes.set(type.name, type);
        if (converters) {
            const objectMetadata = new JsonObjectMetadata(type);
            objectMetadata.isExplicitlyMarked = true;
            type.prototype[META_FIELD] = objectMetadata;
            this.serializer.setSerializationStrategy(type, (value) => {
                return converters.serializer(value, {
                    fallback: (so, td) => this.serializer.convertSingleValue(so, td as TypeDescriptor),
                });
            });
            this.deserializer.setDeserializationStrategy(type, (value) => {
                return converters.deserializer(value, {
                    fallback: (so, td) =>
                        this.deserializer.convertSingleValue(so, td as TypeDescriptor, this.knownTypes),
                });
            });
        }
        this.eventEmitter.emit('register', type, converters);
    }

    /**
     * Get the TypedJSON metadata
     *
     * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
     * @param {any} proto Prototype of target
     * @returns {ObjectMetadata} Root object metadata
     */
    static getMetadata(proto: any): ObjectMetadata {
        return JsonObjectMetadata.getFromConstructor(proto instanceof Function ? proto : proto.constructor);
    }

    /**
     * Get the root TypedJSON metadata
     *
     * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
     * @param {any} proto Prototype of target
     * @returns {ObjectMetadata} Root object metadata
     */
    static getRootMetadata(proto: any): ObjectMetadata {
        const protoProto = proto instanceof Function ? proto.prototype : Object.getPrototypeOf(proto);
        if (!protoProto || !protoProto[META_FIELD]) {
            return proto[META_FIELD];
        }
        return DataSerializer.getRootMetadata(protoProto);
    }

    /**
     * Find the root TypedJSON metadata
     *
     * @deprecated use [[DataSerializer.findRootMetadata]]
     * @param {any} proto Prototype of target
     * @returns {ObjectMetadata} Root object metadata
     */
    static findRootMetaInfo(proto: any): ObjectMetadata {
        return this.getRootMetadata(proto);
    }

    /**
     * Unregister a type
     *
     * @param {typeof any} type Type to unregister
     */
    static unregisterType(type: Serializable<any>): void {
        this.knownTypes.delete(type.name);
        this.eventEmitter.emit('unregister', type);
    }

    static findTypeByName(name: string): Serializable<any> {
        return this.knownTypes.get(name);
    }

    /**
     * Clone a serializable object
     *
     * @param {any} object Serializable object
     * @returns {any} Cloned object
     */
    static clone<T>(object: T): T {
        return this.deserialize(this.serialize(object));
    }

    /**
     * Serialize data
     *
     * @param {any} data Data to serialize
     * @param {DataSerializerConfig} [config] Data serializer configuration
     * @returns {any} Serialized data
     */
    static serialize<T>(data: T, config: DataSerializerConfig = {}): any {
        if (data === null || data === undefined) {
            return undefined;
        }

        const globalDataType = data.constructor;

        // First check if it is a registered type
        // this is important as some serializable classes
        // may extend an array
        if (!this.findTypeByName(data.constructor.name) && Array.isArray(data)) {
            return data.map(this.serialize.bind(this));
        }
        const serializer = config.serializer ?? this.serializer;
        return serializer.convertSingleValue(
            data,
            this.ensureTypeDescriptor(globalDataType),
            undefined,
            undefined,
            config,
        );
    }

    protected static ensureTypeDescriptor(type: Typelike): TypeDescriptor {
        return type instanceof TypeDescriptor ? type : new ConcreteTypeDescriptor(type);
    }

    /**
     * Deserialize data
     *
     * @param serializedData Data to deserialze
     * @param dataType Optional data type to specify deserialization type
     * @param config Data serializer configuration
     */
    static deserialize<T>(serializedData: any, dataType?: Constructor<T>, config?: DataSerializerConfig): T;
    static deserialize<T>(serializedData: any[], dataType?: Constructor<T>, config?: DataSerializerConfig): T[];
    static deserialize<T>(serializedData: any, dataType?: Constructor<T>, config: DataSerializerConfig = {}): T | T[] {
        if ((typeof serializedData !== 'object' && typeof serializedData !== 'function') || !serializedData) {
            return serializedData;
        }

        if (Array.isArray(serializedData)) {
            return serializedData.map((serializedObject) => this.deserialize(serializedObject));
        }

        const deserializer = config.deserializer ?? this.deserializer;
        const finalType = dataType ?? deserializer.getTypeResolver()(serializedData, this.knownTypes);
        if (finalType === Object) {
            return serializedData;
        }
        return deserializer.convertSingleValue(
            serializedData,
            this.ensureTypeDescriptor(finalType),
            this.knownTypes,
            undefined,
            undefined,
            config,
        );
    }
}

export interface DataSerializerConfig {
    /**
     * Set the serializer used for serializing.
     *
     * @default TypedJSON JSON serializer
     */
    serializer?: Serializer;
    /**
     * Set the deserializer used for deserializing.
     *
     * @default TypedJSON JSON deserializer
     */
    deserializer?: Deserializer;
}

export { MappedTypeConverters };

export abstract class TypeDescriptor {
    protected constructor(readonly ctor: Serializable<any>) {}

    getTypes(): Array<Serializable<any>> {
        return [this.ctor];
    }

    hasFriendlyName(): boolean {
        return this.ctor.name !== 'Object';
    }
}

export type Typelike = TypeDescriptor | Serializable<any>;

export class ConcreteTypeDescriptor extends TypeDescriptor {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(ctor: Serializable<any>) {
        super(ctor);
    }
}
