/* eslint-disable */
import { jsonObject, Serializable, IJsonObjectOptions } from 'typedjson';
import { DataSerializer } from '../DataSerializer';

/**
 * Serializable object
 *
 * @param {SerializableObjectOptions} [options] Object serialization options 
 */
export function SerializableObject<T>(options?: IJsonObjectOptions<T>): ClassDecorator {
    return (target: Function) => {
        jsonObject(options)(target as Serializable<T>);
        DataSerializer.findRootMetaInfo(target.prototype).knownTypes.add(target);
        DataSerializer.registerType(target as new () => any);
    };
}
