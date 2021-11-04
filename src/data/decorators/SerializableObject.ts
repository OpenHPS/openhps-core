import { jsonObject, Serializable, IJsonObjectOptions, JsonObjectMetadata } from 'typedjson';
import { DataSerializer } from '../DataSerializer';

/**
 * Serializable object
 *
 * @param {SerializableObjectOptions} [options] Object serialization options
 * @returns {ClassDecorator} Class decorator
 */
export function SerializableObject<T>(options?: SerializableObjectOptions<T>): ClassDecorator {
    return (target: Serializable<T>) => {
        jsonObject(options)(target as Serializable<T>);
        const ownMeta = JsonObjectMetadata.getFromConstructor(target);
        const rootMeta = DataSerializer.findRootMetaInfo(target.prototype);
        rootMeta.knownTypes.add(target);
        if (rootMeta.initializerCallback) {
            ownMeta.initializerCallback = rootMeta.initializerCallback;
        }
        DataSerializer.registerType(target);
        if (options) {
            Object.entries(options).forEach(([key, value]) => {
                ownMeta[key] = value;
            });
        }
    };
}

export interface SerializableObjectOptions<T> extends IJsonObjectOptions<T> {}
