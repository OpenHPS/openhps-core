import { jsonObject, Serializable } from 'typedjson';
import { DataSerializer } from '../DataSerializer';
import { SerializableObjectOptions } from './options';

/**
 * Serializable object
 *
 * @param {SerializableObjectOptions} [options] Object serialization options
 * @returns {ClassDecorator} Class decorator
 */
export function SerializableObject<T>(options?: SerializableObjectOptions<T>): ClassDecorator {
    return (target: Serializable<T>) => {
        jsonObject(options)(target as Serializable<T>);
        const ownMeta = DataSerializer.getMetadata(target);
        const rootMeta = DataSerializer.getRootMetadata(target.prototype);
        rootMeta.knownTypes.add(target);
        if (rootMeta.initializerCallback) {
            ownMeta.initializerCallback = rootMeta.initializerCallback;
        }
        DataSerializer.registerType(target);
        if (options) {
            ownMeta.options = {
                ...ownMeta.options,
                ...options,
            };
        }
    };
}
