import { jsonObject } from 'typedjson';
import { JsonObjectMetadata } from 'typedjson/js/typedjson/metadata';
import { IJsonObjectOptions, IJsonObjectOptionsWithInitializer } from 'typedjson/js/typedjson/json-object';
import { ParameterlessConstructor } from 'typedjson/js/typedjson/types';

const META_FIELD = '__typedJsonJsonObjectMetadataInformation__';
const serializable: Map<string, new () => any> = new Map();

function findRootMetaInfo(proto: any): JsonObjectMetadata {
  const protoProto = Object.getPrototypeOf(proto);
  if (!protoProto || !protoProto[META_FIELD]) {
    return proto[META_FIELD];
  }
  return findRootMetaInfo(protoProto);
}

export function SerializableObject<T>(options?: IJsonObjectOptions<T>): ClassDecorator {
  return (target: Function) => {
    jsonObject(options)(target as ParameterlessConstructor<T>);
    // find root type meta info in TypedJSON, knownTypes needed to understand our type is from our hierarchy
    findRootMetaInfo(target.prototype).knownTypes.add(target);
    serializable.set(target.name, target as new () => any);
  };
}

export function findSerializableObjectByName(name: string): new () => any {
  return serializable.get(name);
}
