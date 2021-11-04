import { Serializer as JSONSerializer } from 'typedjson/lib/cjs/serializer';
import type { Serializer as ISerializer } from 'typedjson/lib/types/serializer';
import type { TypeDescriptor } from 'typedjson/lib/types/type-descriptor';
import type { OptionsBase } from 'typedjson/lib/types/options-base';
import { Serializable, TypeHintEmitter } from 'typedjson';

export class Serializer extends JSONSerializer implements Partial<ISerializer> {
    declare options?: OptionsBase;
    declare typeHintEmitter: TypeHintEmitter;
    declare serializationStrategy: Map<Serializable<any>, SerializerFn<any, TypeDescriptor, any>>;
    declare errorHandler: (error: Error) => void;
    declare setSerializationStrategy: (
        type: Serializable<any>,
        serializer: SerializerFn<any, TypeDescriptor, any>,
    ) => void;
    declare setTypeHintEmitter: (typeEmitterCallback: TypeHintEmitter) => void;
    declare getTypeHintEmitter: () => TypeHintEmitter;
    declare setErrorHandler: (errorHandlerCallback: (error: Error) => void) => void;
    declare getErrorHandler: () => (error: Error) => void;
    declare retrievePreserveNull: (memberOptions?: OptionsBase) => boolean;

    convertSingleValue(
        sourceObject: any,
        typeDescriptor: TypeDescriptor,
        memberName: string,
        memberOptions?: OptionsBase,
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
    serializer: ISerializer,
    memberOptions?: OptionsBase,
) => Raw;

export { TypeDescriptor, OptionsBase };
