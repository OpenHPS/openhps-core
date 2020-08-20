/* eslint-disable */
import { IJsonMemberOptions } from "typedjson/js/typedjson/json-member";
import { jsonMember } from 'typedjson';

export function SerializableMember(options?: IJsonMemberOptions): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        jsonMember(options)(target, propertyKey);
    };
}
