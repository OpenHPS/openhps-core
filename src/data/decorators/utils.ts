import { AnyT, Constructor, JsonObjectMetadata, Serializable } from 'typedjson';
import { DataSerializer } from '../DataSerializer';
import { MemberOptionsBase, SerializableObjectOptions } from './options';

/**
 * Inject member options into object
 *
 * @param {any} target Prototype
 * @param {PropertyKey} propertyKey Property key
 * @param {any} options Options to inject
 */
export function updateSerializableMember(target: unknown, propertyKey: string, options: MemberOptionsBase) {
    // Inject additional options if available
    if (options) {
        const meta = JsonObjectMetadata.ensurePresentInPrototype(target);
        const existingOptions = meta.dataMembers.get(propertyKey) || meta.dataMembers.get(options.name);
        existingOptions.options = {
            ...existingOptions.options,
            ...options,
        };
    }

    // Detect generic types that have no deserialization or constructor specified
    const reflectPropCtor: Constructor<any> = Reflect.getMetadata('design:type', target, propertyKey);
    if (
        reflectPropCtor === Object &&
        (!options || (!options.deserializer && !Object.keys(options).includes('constructor')))
    ) {
        const meta = JsonObjectMetadata.ensurePresentInPrototype(target);
        const existingOptions = meta.dataMembers.get(options ? options.name || propertyKey : propertyKey);
        existingOptions.deserializer = (json) => DataSerializer.deserialize(json);
        existingOptions.serializer = (obj) => DataSerializer.serialize(obj);
        existingOptions.type = () => AnyT;
    }
}

/**
 * Inject object members
 *
 * @param {Serializable} target Target to update
 * @param {SerializableObjectOptions} options Options to inject
 */
export function updateSerializableObject<T>(target: Serializable<T>, options: SerializableObjectOptions<T>): void {
    const ownMeta = DataSerializer.getMetadata(target);
    const rootMeta = DataSerializer.getRootMetadata(target.prototype);
    rootMeta.knownTypes.add(target);
    if (rootMeta.initializerCallback) {
        ownMeta.initializerCallback = rootMeta.initializerCallback;
    }
    DataSerializer.registerType(target);
    if (options) {
        ownMeta.options = mergeDeep(ownMeta.options ?? {}, options);
        if (ownMeta !== rootMeta) {
            rootMeta.options = mergeDeep(rootMeta.options ?? {}, options);
        }
    }
}

/**
 * Check if something is an object
 *
 * @param {any} item Item to check for object
 * @returns {boolean} Is an object
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge objects
 *
 * @param {any} target Target object
 * @param {any} source Source object
 * @returns {any} Merged object
 */
function mergeDeep(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (Array.isArray(source[key])) {
                output[key] = target[key] ?? [];
                output[key].push(...source[key]);
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