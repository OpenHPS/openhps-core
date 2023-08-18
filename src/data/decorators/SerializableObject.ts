import { jsonObject, Serializable } from 'typedjson';
import { DataSerializer } from '../DataSerializer';
import { DataSerializerUtils } from '../DataSerializerUtils';
import { SerializableObjectOptions } from './options';
import { updateSerializableObject } from './utils';

/**
 * Serializable object
 * @param {SerializableObjectOptions} [options] Object serialization options
 * @returns {ClassDecorator} Class decorator
 */
export function SerializableObject<T>(options?: SerializableObjectOptions<T>): ClassDecorator {
    return (target: Serializable<T>) => {
        DataSerializerUtils.createMetadata(target.prototype);
        jsonObject(options)(target);
        DataSerializer['eventEmitter'].emit('updateSerializableObject', target, options);
        updateSerializableObject(target, options);
    };
}
