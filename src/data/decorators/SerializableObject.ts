import { jsonObject, Serializable } from 'typedjson';
import { DataSerializer } from '../DataSerializer';
import { SerializableObjectOptions } from './options';
import { updateSerializableObject } from './utils';

/**
 * Serializable object
 * @param {SerializableObjectOptions} [options] Object serialization options
 * @returns {ClassDecorator} Class decorator
 */
export function SerializableObject<T>(options?: SerializableObjectOptions<T>): ClassDecorator {
    return (target: Serializable<T>) => {
        jsonObject(options)(target);
        DataSerializer['eventEmitter'].emit('updateSerializableObject', target, options);
        updateSerializableObject(target, options);
    };
}
