import 'reflect-metadata';
import { jsonMember, IndexedObject } from 'typedjson';
import { updateSerializableMember, mergeMemberOptions } from './utils';
import { SerializableMemberOptions } from './options';

/**
 * @param {SerializableMemberOptions} [options] Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableMember(options?: SerializableMemberOptions | IndexedObject): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        const finalOptions = mergeMemberOptions(target, propertyKey, options);
        jsonMember(finalOptions)(target, propertyKey);
        updateSerializableMember(target, propertyKey, finalOptions);
    };
}
