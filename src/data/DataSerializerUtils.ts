import { Constructor, JsonObjectMetadata, Serializable } from 'typedjson';
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
     *
     * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
     * @param {any} proto Prototype of target
     * @returns {ObjectMetadata} Root object metadata
     */
    static geOwnMetadata(proto: any): ObjectMetadata {
        return JsonObjectMetadata.getFromConstructor(proto instanceof Function ? proto : proto.constructor);
    }

    /**
     * Get the TypedJSON metadata
     *
     * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
     * @param {any} proto Prototype of target
     * @returns {ObjectMetadata} Root object metadata
     */
    static getMetadata(proto: any): ObjectMetadata {
        return DataSerializerUtils.geOwnMetadata(proto) ?? DataSerializerUtils.getRootMetadata(proto);
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
     *
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
     *
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
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(ctor: Serializable<any>) {
        super(ctor);
    }
}

export type { ArrayTypeDescriptor, MapTypeDescriptor, SetTypeDescriptor } from 'typedjson/lib/types/type-descriptor';
