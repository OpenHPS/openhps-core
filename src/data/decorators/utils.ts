import { AnyT, Constructor, JsonObjectMetadata, Serializable } from 'typedjson';
import { DataSerializer } from '../DataSerializer';
import { DataSerializerUtils } from '../DataSerializerUtils';
import { MemberOptionsBase, SerializableObjectOptions } from './options';
// eslint-disable-next-line
const cloneDeep = require('lodash.clonedeep');

/**
 * Inject member options into object
 * @param {any} target Prototype
 * @param {PropertyKey} propertyKey Property key
 * @param {any} options Options to inject
 */
export function updateSerializableMember(target: unknown, propertyKey: string, options: MemberOptionsBase) {
    // Inject additional options if available
    if (options) {
        const ownMeta = JsonObjectMetadata.ensurePresentInPrototype(target);
        const rootMeta = DataSerializerUtils.getRootMetadata(target.constructor);
        const ownMemberMetadata = ownMeta.dataMembers.get(propertyKey) || ownMeta.dataMembers.get(options.name);
        const rootMemberMetadata = rootMeta.dataMembers.get(propertyKey) || rootMeta.dataMembers.get(options.name);
        if (!ownMemberMetadata) {
            throw new Error(`Unable to get member metadata for ${target} on property ${propertyKey}!`);
        }
        ownMemberMetadata.options = mergeDeep(ownMemberMetadata.options ?? {}, options);
        if (rootMemberMetadata) {
            ownMemberMetadata.options = mergeDeep(rootMemberMetadata.options ?? {}, ownMemberMetadata.options);
        }
        // Merge known sub types as well
        rootMeta.knownTypes.forEach((otherType) => {
            if (otherType === target || target instanceof otherType) {
                return;
            }
            const otherMeta =
                DataSerializerUtils.getMetadata(otherType) ?? JsonObjectMetadata.ensurePresentInPrototype(otherType);
            const otherMemberMetadata =
                otherMeta.dataMembers.get(propertyKey) || otherMeta.dataMembers.get(options.name);
            if (otherMemberMetadata) {
                otherMemberMetadata.options = mergeDeep(ownMemberMetadata.options ?? {}, otherMemberMetadata.options);
            }
        });
        // TODO: Possibly need to sync super types as well
    }

    // Detect generic types that have no deserialization or constructor specified
    const reflectPropCtor: Constructor<any> = Reflect.getMetadata('design:type', target, propertyKey);
    if (
        reflectPropCtor === Object &&
        (!options || (!options.deserializer && !Object.keys(options).includes('constructor')))
    ) {
        const meta = JsonObjectMetadata.ensurePresentInPrototype(target);
        const existingOptions = meta.dataMembers.get(options ? options.name || propertyKey : propertyKey);
        existingOptions.serializer = (object) => DataSerializer.serialize(object);
        existingOptions.deserializer = (objectJson) => DataSerializer.deserialize(objectJson);
        existingOptions.type = () => AnyT;
    }
}

/**
 * Inject object members
 * @param {Serializable} target Target to update
 * @param {SerializableObjectOptions} options Options to inject
 */
export function updateSerializableObject<T>(target: Serializable<T>, options: SerializableObjectOptions<T>): void {
    const ownMeta = DataSerializerUtils.getMetadata(target);
    const rootMeta = DataSerializerUtils.getRootMetadata(target.prototype);
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
        if (otherMeta.initializerCallback && !ownMeta.initializerCallback) {
            ownMeta.initializerCallback = otherMeta.initializerCallback;
        }
    });

    // (Re)register type
    DataSerializer.registerType(target);
}

/**
 * Check if something is an object
 * @param {any} item Item to check for object
 * @returns {boolean} Is an object
 */
function isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge member options
 * @param {unknown} target Target object
 * @param {string} propertyKey Property key in target
 * @param {any} options Member options
 * @returns {any} Merged objects
 */
export function mergeMemberOptions(target: unknown, propertyKey: string, options: any): any {
    if (typeof options === 'function') {
        return options;
    }
    const memberOptions =
        DataSerializerUtils.getMemberOptions(target.constructor as Constructor<any>, propertyKey) ?? {};
    return mergeDeep(options, memberOptions);
}

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
