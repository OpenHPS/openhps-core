import {
    IJsonArrayMemberOptions,
    IJsonMapMemberOptions,
    IJsonMemberOptions,
    IJsonObjectOptions,
    IJsonSetMemberOptions,
} from 'typedjson';

export interface SerializableArrayMemberOptions extends MemberOptionsBase, IJsonArrayMemberOptions {}

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

export interface MemberOptionsBase extends IJsonMemberOptions {}

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
