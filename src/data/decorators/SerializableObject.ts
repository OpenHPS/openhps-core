/* eslint-disable */
import { jsonObject } from 'typedjson';
import { JsonObjectMetadata } from 'typedjson/js/typedjson/metadata';
import { IJsonObjectOptions } from 'typedjson/js/typedjson/json-object';
import { ParameterlessConstructor } from 'typedjson/js/typedjson/types';
import { DataSerializer } from '../DataSerializer';

const META_FIELD = '__typedJsonJsonObjectMetadataInformation__';

/**
 * Find the root TypedJSON metadata
 *
 * @see {@link https://gist.github.com/krizka/c83fb1966dd57997a1fc02625719387d}
 * @param {any} proto Prototype of target 
 */
function findRootMetaInfo(proto: any): JsonObjectMetadata {
    const protoProto = Object.getPrototypeOf(proto);
    if (!protoProto || !protoProto[META_FIELD]) {
        return proto[META_FIELD];
    }
    return findRootMetaInfo(protoProto);
}

/**
 * Serializable object
 *
 * @param {IJsonObjectOptions} [options] Object serialization options 
 */
export function SerializableObject<T>(options?: IJsonObjectOptions<T>): ClassDecorator {
    return (target: Function) => {
        jsonObject(options)(target as ParameterlessConstructor<T>);
        findRootMetaInfo(target.prototype).knownTypes.add(target);
        DataSerializer.registerType(target as new () => any);
    };
}
