import { Serializer as JSONSerializer } from 'typedjson/lib/cjs/serializer';
import type { TypeDescriptor } from 'typedjson/lib/types/type-descriptor';
import type { OptionsBase } from 'typedjson/lib/types/options-base';
import { Serializable, TypeHintEmitter } from 'typedjson';

export class Serializer extends JSONSerializer {
    declare options?: OptionsBase;
    protected declare typeHintEmitter: TypeHintEmitter;
    protected declare serializationStrategy: Map<Serializable<any>, SerializerFn<any, TypeDescriptor, any>>;
    protected declare errorHandler: (error: Error) => void;
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
        memberName?: string,
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
    serializer: Serializer,
    memberOptions?: OptionsBase,
) => Raw;

export { TypeDescriptor, OptionsBase };
