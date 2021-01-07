/* eslint-disable */
import { jsonArrayMember, IJsonArrayMemberOptions } from 'typedjson';

export function SerializableArrayMember(elementConstructor: Function, options?: IJsonArrayMemberOptions): (target: Object, propKey: string | symbol) => void;
export function SerializableArrayMember(elementConstructor: Function, options?: IJsonArrayMemberOptions): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        jsonArrayMember(elementConstructor, options)(target, propertyKey);
    };
}
