import { Serializer as JSONSerializer } from 'typedjson/lib/cjs/serializer';
import type { TypeDescriptor } from 'typedjson/lib/types/type-descriptor';
import { Serializable, TypeHintEmitter } from 'typedjson';
import { MemberOptionsBase } from './decorators/options';
import { ObjectMemberMetadata } from './decorators/metadata';

export class Serializer extends JSONSerializer {
    protected declare typeHintEmitter: TypeHintEmitter;
    protected declare serializationStrategy: Map<Serializable<any>, SerializerFn<any, TypeDescriptor, any>>;
    protected errorHandler: (error: Error) => void = (e: Error) => {
        e.message = e.message.replace('@jsonObject', '@SerializableObject()');
        e.message = e.message.replace('@jsonMember', '@SerializableMember()');
        e.message = e.message.replace('@jsonSetMember', '@SerializableSetMember()');
        e.message = e.message.replace('@jsonMapMember', '@SerializableMapMember()');
        e.message = e.message.replace('@jsonArrayMember', '@SerializableArrayMember()');
        throw e;
    };
    declare setSerializationStrategy: (
        type: Serializable<any>,
        serializer: SerializerFn<any, TypeDescriptor, any>,
    ) => void;
    declare setTypeHintEmitter: (typeEmitterCallback: TypeHintEmitter) => void;
    declare getTypeHintEmitter: () => TypeHintEmitter;
    declare setErrorHandler: (errorHandlerCallback: (error: Error) => void) => void;
    declare getErrorHandler: () => (error: Error) => void;
    declare retrievePreserveNull: (memberOptions?: MemberOptionsBase) => boolean;

    convertSingleValue(
        sourceObject: any,
        typeDescriptor: TypeDescriptor,
        memberName?: string,
        memberOptions?: MemberOptionsBase,
        _?: any, // eslint-disable-line @typescript-eslint/no-unused-vars
    ): any {
        const targetObject = super.convertSingleValue(sourceObject, typeDescriptor, memberName, memberOptions);
        if (memberName === undefined && typeof targetObject === 'object') {
            targetObject.__type = typeDescriptor.ctor.name;
        }
        return targetObject;
    }
}

export type SerializerFn<T, TD extends TypeDescriptor, Raw> = (
    sourceObject: T,
    typeDescriptor: TD,
    memberName: string,
    serializer: Serializer,
    memberOptions?: ObjectMemberMetadata,
    serializerOptions?: any,
) => Raw;
