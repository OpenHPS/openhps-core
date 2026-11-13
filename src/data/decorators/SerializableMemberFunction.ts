import { DataSerializerUtils } from '../DataSerializerUtils';
import { SerializableMemberOptions } from './options';
import { SerializableMember } from './SerializableMember';

/**
 * Registry of functions that were serialized in this process, keyed by their
 * serialized source string. Deserialization only looks functions up in this
 * registry and never evaluates JSON-supplied source, so untrusted payloads
 * can at most reference a callback that was registered locally.
 */
const serializedFunctions: Map<string, (...args: any[]) => any> = new Map();

/**
 * @param {SerializableMemberOptions} [options] Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableMemberFunction(options: SerializableMemberOptions = {}): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        options.serializer = (fn) => {
            if (typeof fn !== 'function') {
                return fn;
            }
            // Register the function so it can be restored on deserialization
            serializedFunctions.set(fn.toString(), fn);
            return fn.toString();
        };
        // Security: do not eval the serialized function source. Only functions
        // that were registered by a local serialization are restored.
        options.deserializer = (fnStr) => {
            if (typeof fnStr === 'string' && serializedFunctions.has(fnStr)) {
                return serializedFunctions.get(fnStr);
            }
            return undefined;
        };
        const finalOptions = DataSerializerUtils.mergeMemberOptions(target, propertyKey, options);
        SerializableMember(finalOptions)(target, propertyKey);
        DataSerializerUtils.updateMemberOptions(target, propertyKey, finalOptions);
    };
}
