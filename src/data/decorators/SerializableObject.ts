import { jsonObject, Serializable } from 'typedjson';
import { SerializableObjectOptions } from './options';
import { updateSerializableObject } from './utils';

/**
 * Serializable object
 *
 * @param {SerializableObjectOptions} [options] Object serialization options
 * @returns {ClassDecorator} Class decorator
 */
export function SerializableObject<T>(options?: SerializableObjectOptions<T>): ClassDecorator {
    return (target: Serializable<T>) => {
        jsonObject(options)(target);
        updateSerializableObject(target, options);
    };
}
