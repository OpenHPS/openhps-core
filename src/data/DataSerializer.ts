import { EventEmitter } from 'events';
import { JsonObjectMetadata, Constructor, Serializable } from 'typedjson';
import type { MappedTypeConverters } from 'typedjson/lib/types/parser';
import { DataSerializerUtils, TypeDescriptor } from './DataSerializerUtils';
import { ObjectMetadata } from './decorators/metadata';
import { Deserializer } from './Deserializer';
import { Serializer } from './Serializer';

JsonObjectMetadata.getFromConstructor = function (ctor) {
    if (!ctor) {
        return;
    }
    const prototype = ctor.prototype;

    if (prototype == null) {
        return;
    }

    let metadata: JsonObjectMetadata | undefined;
    if (Object.prototype.hasOwnProperty.call(prototype, DataSerializerUtils.META_FIELD)) {
        // The class prototype contains own jsonObject metadata
        metadata = prototype[DataSerializerUtils.META_FIELD];
    } else {
        const parent = Object.getPrototypeOf(ctor.prototype);
        if (!parent) {
            return;
        }
        metadata = JsonObjectMetadata.getFromConstructor(parent.constructor);
    }

    // Ignore implicitly added jsonObject (through jsonMember)
    if (metadata?.isExplicitlyMarked === true) {
        return metadata;
    }

    // In the end maybe it is something which we can handle directly
    if (JsonObjectMetadata['doesHandleWithoutAnnotation'](ctor)) {
        const primitiveMeta = new JsonObjectMetadata(ctor);
        primitiveMeta.isExplicitlyMarked = true;
        // we do not store the metadata here to not modify builtin prototype
        return primitiveMeta;
    }
};

/**
 * Allows the serialization and deserialization of objects using the {@link SerializableObject} decorator.
 *
 * ## Usage
 *
 * ### Registration
 * Objects are registered upon loading with the {@link SerializableObject} decorator.
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
     * @param {typeof any} type Type to register
     * @param {MappedTypeConverters} [converters] Optional converters
     */
    static registerType<T>(type: Serializable<T>, converters?: MappedTypeConverters<T>): void {
        DataSerializer.knownTypes.set(type.name, type);
        if (converters) {
            DataSerializer.serializer.setSerializationStrategy(type, (value) => {
                return converters.serializer(value, {
                    fallback: (so, td) => DataSerializer.serializer.convertSingleValue(so, td as TypeDescriptor),
                });
            });
            DataSerializer.deserializer.setDeserializationStrategy(type, (value) => {
                return converters.deserializer(value, {
                    fallback: (so, td) =>
                        DataSerializer.deserializer.convertSingleValue(
                            so,
                            td as TypeDescriptor,
                            DataSerializer.knownTypes,
                        ),
                });
            });
            if (type.name !== 'Object') {
                const objectMetadata = new JsonObjectMetadata(type);
                objectMetadata.isExplicitlyMarked = true;
                type.prototype[DataSerializerUtils.META_FIELD] = objectMetadata;
            }
        }
        DataSerializer.eventEmitter.emit('registerType', type, converters);
    }

    static {
        DataSerializer.registerType(Object, {
            serializer: (object) => ({
                ...Object.keys(object)
                    .map((key) => {
                        return {
                            [key]:
                                typeof object[key] === 'function'
                                    ? {
                                          function: object[key].toString(),
                                          __type: 'Function',
                                      }
                                    : DataSerializer.serialize(object[key]),
                        };
                    })
                    .reduce((a, b) => ({ ...a, ...b }), {}),
                __type: 'Object',
            }),
            deserializer: (objectJson) =>
                Object.keys(objectJson)
                    .map((key) => {
                        if (key === '__type') {
                            return {};
                        }
                        return {
                            [key]:
                                typeof objectJson[key] === 'object' && objectJson[key].__type === 'Function'
                                    ? eval(objectJson[key].function)
                                    : DataSerializer.deserialize(objectJson[key]),
                        };
                    })
                    .reduce((a, b) => ({ ...a, ...b }), {}),
        });
    }

    /**
     * Get the TypedJSON metadata
     * @deprecated use {@link DataSerializerUtils.getMetadata}
     * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
     * @param {any} proto Prototype of target
     * @returns {ObjectMetadata} Root object metadata
     */
    static getMetadata(proto: any): ObjectMetadata {
        return DataSerializerUtils.getMetadata(proto);
    }

    /**
     * Get the root TypedJSON metadata
     * @deprecated use {@link DataSerializerUtils.getRootMetadata}
     * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
     * @param {any} proto Prototype of target
     * @returns {ObjectMetadata} Root object metadata
     */
    static getRootMetadata(proto: any): ObjectMetadata {
        return DataSerializerUtils.getRootMetadata(proto);
    }

    /**
     * Find the root TypedJSON metadata
     * @deprecated use {@link DataSerializerUtils.getRootMetadata}
     * @param {any} proto Prototype of target
     * @returns {ObjectMetadata} Root object metadata
     */
    static findRootMetaInfo(proto: any): ObjectMetadata {
        return DataSerializerUtils.getRootMetadata(proto);
    }

    /**
     * Unregister a type
     * @param {typeof any} type Type to unregister
     */
    static unregisterType(type: Serializable<any>): void {
        DataSerializer.knownTypes.delete(type.name);
        DataSerializer.eventEmitter.emit('unregisterType', type);
    }

    static findTypeByName(name: string): Serializable<any> {
        return DataSerializer.knownTypes.get(name);
    }

    /**
     * Clone a serializable object
     * @param {any} object Serializable object
     * @param {Constructor<any>} [dataType] Data type to clone to
     * @returns {any} Cloned object
     */
    static clone<T, D = T>(object: T, dataType?: Constructor<D>): D {
        return DataSerializer.deserialize(DataSerializer.serialize(object), dataType);
    }

    /**
     * Serialize data
     * @param {any} data Data to serialize
     * @param {DataSerializerConfig} [config] Data serializer configuration
     * @returns {any} Serialized data
     */
    static serialize<T>(data: T, config: DataSerializerConfig = {}): any {
        if (data === null || data === undefined) {
            return undefined;
        }

        const globalDataType = Object.getPrototypeOf(data).constructor;

        // First check if it is a registered type
        // this is important as some serializable classes
        // may extend an array
        if (!DataSerializer.findTypeByName(globalDataType.name) && Array.isArray(data)) {
            return data.map(DataSerializer.serialize.bind(DataSerializer));
        }
        const serializer = config.serializer ?? DataSerializer.serializer;
        return serializer.convertSingleValue(
            data,
            DataSerializerUtils.ensureTypeDescriptor(globalDataType),
            undefined,
            undefined,
            config,
        );
    }

    /**
     * Deserialize data
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
            return serializedData.map((serializedObject) => DataSerializer.deserialize(serializedObject));
        }

        const deserializer = config.deserializer ?? DataSerializer.deserializer;
        const finalType = dataType ?? deserializer.getTypeResolver()(serializedData, DataSerializer.knownTypes);
        return deserializer.convertSingleValue(
            serializedData,
            DataSerializerUtils.ensureTypeDescriptor(finalType),
            DataSerializer.knownTypes,
            undefined,
            undefined,
            config,
        );
    }
}

export interface DataSerializerConfig {
    /**
     * Set the serializer used for serializing.
     * @default TypedJSON JSON serializer
     */
    serializer?: Serializer;
    /**
     * Set the deserializer used for deserializing.
     * @default TypedJSON JSON deserializer
     */
    deserializer?: Deserializer;
}
