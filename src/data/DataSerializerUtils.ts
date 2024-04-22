import { Constructor, IndexedObject, JsonObjectMetadata, Serializable } from 'typedjson';
import type { MappedTypeConverters } from 'typedjson/lib/types/parser';
import { ObjectMetadata } from './decorators/metadata';
import { SerializableMemberOptions } from './decorators/options';

/**
 * Data serializer utilities for managing the ORM mapping
 */
export class DataSerializerUtils {
    static get META_FIELD(): string {
        return '__typedJsonJsonObjectMetadataInformation__';
    }

    /**
     * Get the own TypedJSON metadata of the prototype
     * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
     * @param {any} proto Prototype of target
     * @returns {ObjectMetadata} Root object metadata
     */
    static getOwnMetadata(proto: any): ObjectMetadata {
        return JsonObjectMetadata.getFromConstructor(proto instanceof Function ? proto : proto.constructor);
    }

    /**
     * Get the TypedJSON metadata
     * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
     * @param {any} proto Prototype of target
     * @returns {ObjectMetadata} Root object metadata
     */
    static getMetadata(proto: any): ObjectMetadata {
        return DataSerializerUtils.getOwnMetadata(proto) ?? DataSerializerUtils.getRootMetadata(proto);
    }

    static createMetadata(proto: IndexedObject): ObjectMetadata {
        if (Object.prototype.hasOwnProperty.call(proto, this.META_FIELD)) {
            return proto[this.META_FIELD];
        }
        // Target has no JsonObjectMetadata associated with it yet, create it now.
        const objectMetadata = new JsonObjectMetadata(proto.constructor);

        // Inherit json members and known types from parent @jsonObject (if any).
        const parentMetadata: JsonObjectMetadata | undefined = proto[this.META_FIELD];

        if (parentMetadata !== undefined) {
            parentMetadata.dataMembers.forEach((memberMetadata, propKey) => {
                objectMetadata.dataMembers.set(propKey, memberMetadata);
            });
            parentMetadata.knownTypes.forEach((knownType) => {
                // Only add if sub type
                if (knownType === proto.constructor || !(knownType.prototype instanceof proto.constructor)) {
                    return;
                }
                objectMetadata.knownTypes.add(knownType);
            });
            // Add sub class to parent
            parentMetadata.knownTypes.add(objectMetadata.classType);
            objectMetadata.typeResolver = parentMetadata.typeResolver;
            objectMetadata.typeHintEmitter = parentMetadata.typeHintEmitter;
        }

        Object.defineProperty(proto, this.META_FIELD, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: objectMetadata,
        });
        return objectMetadata;
    }

    /**
     * Get the root TypedJSON metadata
     * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
     * @param {any} proto Prototype of target
     * @returns {ObjectMetadata} Root object metadata
     */
    static getRootMetadata(proto: any): ObjectMetadata {
        const protoProto = proto instanceof Function ? proto.prototype : Object.getPrototypeOf(proto);
        if (!protoProto || !protoProto[DataSerializerUtils.META_FIELD]) {
            return proto[DataSerializerUtils.META_FIELD];
        }
        return DataSerializerUtils.getRootMetadata(protoProto);
    }

    static ensureTypeDescriptor(type: Typelike): TypeDescriptor {
        return type instanceof TypeDescriptor ? type : new ConcreteTypeDescriptor(type);
    }

    /**
     * Get member options of a property in a data type
     * @param {Constructor} dataType Data type
     * @param {string} propertyKey Property key
     * @returns {SerializableMemberOptions} member options
     */
    static getMemberOptions<T>(dataType: Constructor<T>, propertyKey: string): SerializableMemberOptions {
        const metadata = DataSerializerUtils.getMetadata(dataType);
        if (!metadata) {
            return undefined;
        }
        const dataMember = metadata.dataMembers.get(propertyKey);
        if (!dataMember) {
            return undefined;
        }
        return dataMember.options;
    }

    /**
     * Get member options of an identifier property in a data type
     * @param {Constructor} dataType Data type
     * @returns {SerializableMemberOptions} identifier member options
     */
    static getIdentifierMemberOptions<T>(dataType: Constructor<T>): SerializableMemberOptions {
        const metadata = DataSerializerUtils.getMetadata(dataType);
        if (!metadata) {
            return undefined;
        }
        return Array.from(metadata.dataMembers.values()).filter((member) => {
            return member && (member as SerializableMemberOptions).primaryKey;
        })[0];
    }
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
    constructor(ctor: Serializable<any>) {
        super(ctor);
    }
}

export type { ArrayTypeDescriptor, MapTypeDescriptor, SetTypeDescriptor } from 'typedjson/lib/types/type-descriptor';
