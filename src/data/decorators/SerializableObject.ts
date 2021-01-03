/* eslint-disable */
import { jsonObject } from 'typedjson';
import { IJsonObjectOptions } from 'typedjson/js/typedjson/json-object';
import { ParameterlessConstructor } from 'typedjson/js/typedjson/types';
import { DataSerializer } from '../DataSerializer';

/**
 * Serializable object
 *
 * @param {SerializableObjectOptions} [options] Object serialization options 
 */
export function SerializableObject<T>(options?: IJsonObjectOptions<T>): ClassDecorator {
    return (target: Function) => {
        jsonObject(options)(target as ParameterlessConstructor<T>);
        DataSerializer.findRootMetaInfo(target.prototype).knownTypes.add(target);
        DataSerializer.registerType(target as new () => any);
    };
}
