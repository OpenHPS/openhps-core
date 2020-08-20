/* eslint-disable */
import { jsonSetMember } from "typedjson";
import { IJsonSetMemberOptions } from "typedjson/js/typedjson/json-set-member";

export function SerializableSetMember(elementConstructor: Function, options?: IJsonSetMemberOptions): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        jsonSetMember(elementConstructor, options)(target, propertyKey);
    };
}
