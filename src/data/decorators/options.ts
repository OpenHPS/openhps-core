import {
    IJsonArrayMemberOptions,
    IJsonMapMemberOptions,
    IJsonMemberOptions,
    IJsonObjectOptions,
    IJsonSetMemberOptions,
    Serializable,
} from 'typedjson';
import type { TypeDescriptor } from 'typedjson/lib/types/type-descriptor';

export interface CustomDeserializerParams {
    fallback: (sourceObject: any, constructor: Serializable<any> | TypeDescriptor) => any;
}

export interface CustomSerializerParams {
    fallback: (sourceObject: any, constructor: Serializable<any> | TypeDescriptor) => any;
}

export interface MemberOptionsBase extends IJsonMemberOptions {
    /**
     * Custom deserializer for member
     */
    deserializer?: ((json: any, params: CustomDeserializerParams) => any) | null;
    /**
     * Custom serialized for member
     */
    serializer?: ((value: any, params: CustomSerializerParams) => any) | null;
}

export interface SerializableObjectOptions<T> extends IJsonObjectOptions<T> {}

export interface SerializableMemberOptions extends MemberOptionsBase {
    /**
     * Identify this attribute as unique
     */
    unique?: boolean;
    /**
     * Identify this attribute as a primary key
     */
    primaryKey?: boolean;
    /**
     * Create an index on this attribute. Possible values
     * are true/false or a string for specifying this attribute
     * as part of multiple attributes in an index.
     */
    index?: string | boolean;
    /**
     * Experimental number type
     */
    numberType?: NumberType;
}

export interface SerializableArrayMemberOptions extends MemberOptionsBase, IJsonArrayMemberOptions {}

export interface SerializableSetMemberOptions extends MemberOptionsBase, IJsonSetMemberOptions {}

export interface SerializableMapMemberOptions extends MemberOptionsBase, IJsonMapMemberOptions {}

export enum NumberType {
    INTEGER,
    FLOAT,
    DOUBLE,
    DECIMAL,
    LONG,
    SHORT,
}
