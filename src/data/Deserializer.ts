import { Deserializer as JSONDeserializer } from 'typedjson/lib/cjs/deserializer';
import type { TypeDescriptor } from 'typedjson/lib/types/type-descriptor';
import { IndexedObject, Serializable, TypeResolver } from 'typedjson';
import { ObjectMemberMetadata } from './decorators/metadata';

export class Deserializer extends JSONDeserializer {
    protected declare deserializationStrategy: Map<Serializable<any>, DeserializerFn<any, TypeDescriptor, any>>;
    protected errorHandler: (error: Error) => void = (e: Error) => {
        e.message = e.message.replace('@jsonObject', '@SerializableObject()');
        e.message = e.message.replace('@jsonMember', '@SerializableMember()');
        e.message = e.message.replace('@jsonSetMember', '@SerializableSetMember()');
        e.message = e.message.replace('@jsonMapMember', '@SerializableMapMember()');
        e.message = e.message.replace('@jsonArrayMember', '@SerializableArrayMember()');
        throw e;
    };
    protected typeResolver(sourceObject: IndexedObject, knownTypes: Map<string, Serializable<any>>) {
        return sourceObject['__type'] !== undefined
            ? knownTypes.get(sourceObject.__type)
            : sourceObject.constructor ?? Object;
    }
    protected declare nameResolver?: (ctor: Serializable<any>) => string;
    declare setDeserializationStrategy: (
        type: Serializable<any>,
        deserializer: DeserializerFn<any, TypeDescriptor, any>,
    ) => void;
    declare setNameResolver: (nameResolverCallback: (ctor: Serializable<any>) => string) => void;
    declare setTypeResolver: (typeResolverCallback: TypeResolver) => void;
    declare getTypeResolver: () => TypeResolver;
    declare setErrorHandler: (errorHandlerCallback: (error: Error) => void) => void;
    declare getErrorHandler: () => (error: Error) => void;
    declare instantiateType: (ctor: any) => any;
    declare mergeKnownTypes: (
        ...knownTypeMaps: Array<Map<string, Serializable<any>>>
    ) => Map<string, Serializable<any>>;
    declare createKnownTypesMap: (knowTypes: Set<Serializable<any>>) => Map<string, Serializable<any>>;
    declare retrievePreserveNull: (memberOptions?: ObjectMemberMetadata) => boolean;

    convertSingleValue(
        sourceObject: any,
        typeDescriptor: TypeDescriptor,
        knownTypes: Map<string, Serializable<any>>,
        memberName?: string,
        memberOptions?: ObjectMemberMetadata,
        _?: any, // eslint-disable-line @typescript-eslint/no-unused-vars
    ): any {
        return super.convertSingleValue(sourceObject, typeDescriptor, knownTypes, memberName, memberOptions);
    }
}

export type DeserializerFn<T, TD extends TypeDescriptor, Raw> = (
    sourceObject: Raw,
    typeDescriptor: TD,
    knownTypes: Map<string, Serializable<any>>,
    memberName: string,
    deserializer: Deserializer,
    memberOptions?: ObjectMemberMetadata,
) => T;
