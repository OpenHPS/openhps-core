import { jsonSetMember, Constructor } from 'typedjson';
import { SerializableSetMemberOptions } from './options';
import { mergeMemberOptions, updateSerializableMember } from './utils';

/**
 * @param {Constructor} elementConstructor Element constructor
 * @param {SerializableSetMemberOptions} options Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableSetMember<T>(
    elementConstructor: Constructor<T>,
    options?: SerializableSetMemberOptions,
): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        const finalOptions = mergeMemberOptions(target, propertyKey, options);
        jsonSetMember(elementConstructor, finalOptions)(target, propertyKey);
        updateSerializableMember(target, propertyKey, finalOptions);
    };
}
