/* eslint-disable */
import { IJsonArrayMemberOptions } from "typedjson/js/typedjson/json-array-member";
import { jsonArrayMember } from 'typedjson';

export function SerializableArrayMember(elementConstructor: Function, options?: IJsonArrayMemberOptions): (target: Object, propKey: string | symbol) => void;
export function SerializableArrayMember(elementConstructor: Function, options?: IJsonArrayMemberOptions): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        jsonArrayMember(elementConstructor, options)(target, propertyKey);
    };
}
