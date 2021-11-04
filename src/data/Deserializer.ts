import { Deserializer as JSONDeserializer } from 'typedjson/lib/cjs/deserializer';
import type { Deserializer as IDeserializer } from 'typedjson/lib/types/deserializer';
import type { TypeDescriptor } from 'typedjson/lib/types/type-descriptor';
import type { OptionsBase } from 'typedjson/lib/types/options-base';
import { Serializable, TypeResolver } from 'typedjson';

export class Deserializer<T> extends JSONDeserializer implements Partial<IDeserializer<T>> {
    declare deserializationStrategy: Map<Serializable<any>, DeserializerFn<any, TypeDescriptor, any>>;
    declare errorHandler: (error: Error) => void;
    declare typeResolver: TypeResolver;
    declare nameResolver?: (ctor: Serializable<any>) => string;
    declare options?: OptionsBase;

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
    declare retrievePreserveNull: (memberOptions?: OptionsBase) => boolean;

    convertSingleValue(
        sourceObject: any,
        typeDescriptor: TypeDescriptor,
        knownTypes: Map<string, Serializable<any>>,
        memberName = 'object',
        memberOptions?: OptionsBase,
    ): any {
        return super.convertSingleValue(sourceObject, typeDescriptor, knownTypes, memberName, memberOptions);
    }
}

export type DeserializerFn<T, TD extends TypeDescriptor, Raw> = (
    sourceObject: Raw,
    typeDescriptor: TD,
    knownTypes: Map<string, Serializable<any>>,
    memberName: string,
    deserializer: IDeserializer<T>,
    memberOptions?: OptionsBase,
) => T;
