import { TypedJSON, JsonObjectMetadata, ITypedJSONSettings, Constructor, Serializable, IndexedObject } from 'typedjson';
import type { MappedTypeConverters } from 'typedjson/lib/types/parser';
import { Deserializer } from './Deserializer';
import { Serializer } from './Serializer';

const META_FIELD = '__typedJsonJsonObjectMetadataInformation__';

/* Set global TypedJSON options for decorator errors */
TypedJSON.setGlobalConfig({
    errorHandler: (e: Error) => {
        e.message = e.message.replace('@jsonObject', '@SerializableObject()');
        e.message = e.message.replace('@jsonMember', '@SerializableMember()');
        e.message = e.message.replace('@jsonSetMember', '@SerializableSetMember()');
        e.message = e.message.replace('@jsonMapMember', '@SerializableMapMember()');
        e.message = e.message.replace('@jsonArrayMember', '@SerializableArrayMember()');
        throw e;
    },
});

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
    static serializableTypes: Map<string, Serializable<any>> = new Map();
    static readonly defaultSettings: DataSerializerConfig = {
        typeResolver: (sourceObject: IndexedObject, knownTypes: Map<string, Serializable<any>>) => {
            return sourceObject['__type'] !== undefined
                ? knownTypes.get(sourceObject.__type)
                : sourceObject.constructor ?? Object;
        },
    };

    static get globalConfig(): DataSerializerConfig {
        return {
            ...TypedJSON['_globalConfig'],
            ...this.defaultSettings,
        };
    }

    /**
     * Manually register a new type
     *
     * @param {typeof any} type Type to register
     * @param {MappedTypeConverters} [converters] Optional converters
     */
    static registerType<T>(type: Serializable<T>, converters?: MappedTypeConverters<T>): void {
        this.serializableTypes.set(type.name, type);
        if (converters) {
            const objectMetadata = new JsonObjectMetadata(type);
            objectMetadata.isExplicitlyMarked = true;
            type.prototype[META_FIELD] = objectMetadata;
            TypedJSON.mapType(type, converters);
        }
    }

    /**
     * Get the TypedJSON metadata
     *
     * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
     * @param {any} proto Prototype of target
     * @returns {JsonObjectMetadata} Root object metadata
     */
    static getMetadata(proto: any): JsonObjectMetadata {
        return JsonObjectMetadata.getFromConstructor(proto instanceof Function ? proto : proto.constructor);
    }

    /**
     * Get the root TypedJSON metadata
     *
     * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
     * @param {any} proto Prototype of target
     * @returns {JsonObjectMetadata} Root object metadata
     */
    static getRootMetadata(proto: any): JsonObjectMetadata {
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
     * @returns {JsonObjectMetadata} Root object metadata
     */
    static findRootMetaInfo(proto: any): JsonObjectMetadata {
        return this.getRootMetadata(proto);
    }

    /**
     * Unregister a type
     *
     * @param {typeof any} type Type to unregister
     */
    static unregisterType(type: Serializable<any>): void {
        this.serializableTypes.delete(type.name);
    }

    static findTypeByName(name: string): Serializable<any> {
        return this.serializableTypes.get(name);
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
    static serialize<T>(data: T, config?: DataSerializerConfig): any {
        if (data === null || data === undefined) {
            return undefined;
        }

        const globalDataType = data.constructor;

        const mergedConfig = {
            ...this.globalConfig,
            ...config,
        };

        // First check if it is a registered type
        // this is important as some serializable classes
        // may extend an array
        if (this.findTypeByName(data.constructor.name)) {
            const typedJSON = new TypedJSON(globalDataType);
            typedJSON['serializer'] = mergedConfig.serializer ?? new Serializer();
            typedJSON['deserializer'] = mergedConfig.deserializer ?? new Deserializer();
            typedJSON.config(mergedConfig);
            return typedJSON.toPlainJson(data);
        } else if (Array.isArray(data)) {
            return data.map(this.serialize.bind(this));
        } else {
            const typedJSON = new TypedJSON(globalDataType);
            typedJSON['serializer'] = mergedConfig.serializer ?? new Serializer();
            typedJSON['deserializer'] = mergedConfig.deserializer ?? new Deserializer();
            typedJSON.config(mergedConfig);
            return typedJSON.toPlainJson(data);
        }
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
    static deserialize<T>(serializedData: any, dataType?: Constructor<T>, config?: DataSerializerConfig): T | T[] {
        if ((typeof serializedData !== 'object' && typeof serializedData !== 'function') || !serializedData) {
            return serializedData;
        }

        if (Array.isArray(serializedData)) {
            return serializedData.map((serializedObject) => this.deserialize(serializedObject));
        }

        const mergedConfig = {
            ...this.globalConfig,
            ...config,
        };

        const finalType = dataType ?? mergedConfig.typeResolver(serializedData, this.serializableTypes);
        if (finalType === Object) {
            return serializedData;
        }
        const typedJSON = new TypedJSON(finalType);
        typedJSON['serializer'] = mergedConfig.serializer ?? new Serializer();
        typedJSON['deserializer'] = mergedConfig.deserializer ?? new Deserializer();
        typedJSON.config(mergedConfig);
        return typedJSON.parse(serializedData);
    }
}

export interface DataSerializerConfig extends ITypedJSONSettings {
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
    deserializer?: Deserializer<any>;
}

export { MappedTypeConverters };
