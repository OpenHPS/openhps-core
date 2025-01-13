import { AnyT, Constructor, IndexedObject, JsonObjectMetadata, Serializable } from 'typedjson';
import { ObjectMetadata } from './decorators/metadata';
import { SerializableMemberOptions, SerializableObjectOptions } from './decorators/options';
import { cloneDeep, isObject } from './decorators/utils';

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

    /**
     * Deep merge member options
     * @param {unknown} target Target object
     * @param {string} propertyKey Property key in target
     * @param {any} options Member options
     * @returns {any} Merged objects
     */
    static mergeMemberOptions(target: unknown, propertyKey: string, options: any): any {
        if (typeof options === 'function') {
            return options;
        }
        const memberOptions = DataSerializerUtils.getMemberOptions(target.constructor as Constructor<any>, propertyKey);
        if (!memberOptions) {
            return options;
        }
        return mergeDeep(memberOptions, options);
    }

    static updateMemberOptions(
        target: unknown,
        propertyKey: string,
        options: SerializableMemberOptions | IndexedObject,
    ) {
        const reflectPropCtor: Constructor<any> = Reflect.getMetadata('design:type', target, propertyKey);

        // Inject additional options if available
        if (options) {
            const ownMeta = JsonObjectMetadata.ensurePresentInPrototype(target);
            const rootMeta = DataSerializerUtils.getRootMetadata(target.constructor);
            const ownMemberMetadata = ownMeta.dataMembers.get(propertyKey) || ownMeta.dataMembers.get(options.name);
            const rootMemberMetadata = rootMeta
                ? rootMeta.dataMembers.get(propertyKey) || rootMeta.dataMembers.get(options.name)
                : undefined;
            if (!ownMemberMetadata) {
                throw new Error(`Unable to get member metadata for ${target} on property ${propertyKey}!`);
            }
            ownMemberMetadata.options = mergeDeep(ownMemberMetadata.options ?? {}, options);
            if (rootMemberMetadata) {
                ownMemberMetadata.options = mergeDeep(rootMemberMetadata.options ?? {}, ownMemberMetadata.options);
            }
            // Merge known sub types as well
            rootMeta.knownTypes.forEach((otherType) => {
                if (otherType === target.constructor || !(otherType.prototype instanceof target.constructor)) {
                    return;
                }
                const otherMeta =
                    DataSerializerUtils.getMetadata(otherType) ??
                    JsonObjectMetadata.ensurePresentInPrototype(otherType);
                const otherMemberMetadata =
                    otherMeta.dataMembers.get(propertyKey) || otherMeta.dataMembers.get(options.name);
                if (otherMemberMetadata) {
                    otherMemberMetadata.options = mergeDeep(
                        ownMemberMetadata.options ?? {},
                        otherMemberMetadata.options,
                    );
                } else {
                    otherMeta.dataMembers.set(options.name ?? propertyKey, cloneDeep(ownMemberMetadata));
                }
            });
            // TODO: Possibly need to sync super types as well
        }

        // Detect generic types that have no deserialization or constructor specified
        const meta = JsonObjectMetadata.ensurePresentInPrototype(target);
        const existingOptions = meta.dataMembers.get(options ? options.name || propertyKey : propertyKey);
        if (
            reflectPropCtor === Object &&
            (!options || (!options.deserializer && !Object.keys(options).includes('constructor')))
        ) {
            // If the type is Object and no deserializer is specified, it can be any
            // type of object, including serializable objects.
            existingOptions.type = () => AnyT;
        } else if (
            existingOptions &&
            typeof options !== 'object' &&
            existingOptions.type() instanceof ConcreteTypeDescriptor
        ) {
            existingOptions.type = () => new ConcreteTypeDescriptor(reflectPropCtor);
        }
    }

    static updateObjectMetadata<T>(
        target: Serializable<T>,
        options: SerializableObjectOptions<T>,
        ownMeta: ObjectMetadata,
        rootMeta: ObjectMetadata,
    ): ObjectMetadata {
        rootMeta.knownTypes.add(target);
        if (rootMeta.initializerCallback && !ownMeta.initializerCallback) {
            ownMeta.initializerCallback = rootMeta.initializerCallback;
        }

        // Merge options
        if (options) {
            ownMeta.options = mergeDeep(
                ownMeta === rootMeta ? ownMeta.options ?? {} : ownMeta.options ?? rootMeta.options ?? {},
                options,
            );

            // Merge known sub types as well
            rootMeta.knownTypes.forEach((otherType) => {
                if (otherType === target || !(otherType.prototype instanceof target)) {
                    return;
                }

                const otherMeta = DataSerializerUtils.getMetadata(otherType);
                otherMeta.options = mergeDeep(ownMeta.options ?? {}, otherMeta.options);

                if (!otherMeta.initializerCallback && ownMeta.initializerCallback) {
                    otherMeta.initializerCallback = ownMeta.initializerCallback;
                }
            });
        }

        // Sync settings from super types
        rootMeta.knownTypes.forEach((otherType) => {
            if (otherType === target || !(target.prototype instanceof otherType)) {
                return;
            }

            const otherMeta = DataSerializerUtils.getMetadata(otherType);
            if (otherMeta && otherMeta.initializerCallback && !ownMeta.initializerCallback) {
                ownMeta.initializerCallback = otherMeta.initializerCallback;
            }
        });
        return ownMeta;
    }
}

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

/**
 * Deep merge objects
 * @param {any} target Target object
 * @param {any} source Source object
 * @returns {any} Merged object
 */
function mergeDeep(target: any, source: any): any {
    const output = cloneDeep(target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (Array.isArray(source[key])) {
                output[key] = source[key];
                const targetProperty =
                    target[key] !== undefined ? (Array.isArray(target[key]) ? target[key] : [target[key]]) : [];
                output[key].push(...targetProperty.filter((val: any) => !source[key].includes(val)));
            } else if (isObject(source[key])) {
                if (!(key in target)) Object.assign(output, { [key]: source[key] });
                else output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}
