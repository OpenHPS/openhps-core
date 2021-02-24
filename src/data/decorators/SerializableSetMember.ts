/* eslint-disable */
import { jsonSetMember, IJsonSetMemberOptions } from "typedjson";

export function SerializableSetMember(elementConstructor: Function, options?: IJsonSetMemberOptions): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        jsonSetMember(elementConstructor, options)(target, propertyKey);
    };
}
