import { jsonObject, Serializable, IJsonObjectOptions, JsonObjectMetadata } from 'typedjson';
import { DataSerializer } from '../DataSerializer';

/**
 * Serializable object
 *
 * @param {IJsonObjectOptions} [options] Object serialization options
 * @returns {ClassDecorator} Class decorator
 */
export function SerializableObject<T>(options?: IJsonObjectOptions<T>): ClassDecorator {
    return (target: Serializable<T>) => {
        jsonObject(options)(target as Serializable<T>);
        const ownMeta = JsonObjectMetadata.getFromConstructor(target);
        const rootMeta = DataSerializer.findRootMetaInfo(target.prototype);
        rootMeta.knownTypes.add(target);
        if (rootMeta.initializerCallback) {
            ownMeta.initializerCallback = rootMeta.initializerCallback;
        }
        DataSerializer.registerType(target as new () => any);
        if (options) {
            Object.entries(options).forEach(([key, value]) => {
                ownMeta[key] = value;
            });
        }
    };
}
