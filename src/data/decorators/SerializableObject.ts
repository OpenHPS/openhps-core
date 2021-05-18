import { jsonObject, Serializable, IJsonObjectOptions } from 'typedjson';
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
        DataSerializer.findRootMetaInfo(target.prototype).knownTypes.add(target);
        DataSerializer.registerType(target as new () => any);
    };
}
