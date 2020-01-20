import { jsonObject } from 'typedjson';
import { JsonObjectMetadata } from 'typedjson/js/typedjson/metadata';
import { IJsonObjectOptions } from 'typedjson/js/typedjson/json-object';
import { ParameterlessConstructor } from 'typedjson/js/typedjson/types';

const META_FIELD = '__typedJsonJsonObjectMetadataInformation__';

function findRootMetaInfo(proto: any): JsonObjectMetadata {
  const protoProto = Object.getPrototypeOf(proto);
  if (!protoProto || !protoProto[META_FIELD]) {
    return proto[META_FIELD];
  }
  return findRootMetaInfo(protoProto);
}

export function SerializableObject(options?: IJsonObjectOptions<any>): ClassDecorator {
  return (target: Function) => {
    jsonObject(options)(target as ParameterlessConstructor<any>);
    // find root type meta info in TypedJSON, knownTypes needed to understand our type is from our hierarchy
    findRootMetaInfo(target.prototype).knownTypes.add(target);
  };
}
