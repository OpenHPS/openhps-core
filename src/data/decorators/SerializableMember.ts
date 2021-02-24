/* eslint-disable */
import { jsonMember, IJsonMemberOptions } from 'typedjson';

export function SerializableMember(options?: IJsonMemberOptions): PropertyDecorator {
    return (target: Object, propertyKey: string) => {
        jsonMember(options)(target, propertyKey);
    };
}
