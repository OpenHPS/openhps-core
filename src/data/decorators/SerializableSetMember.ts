import { jsonSetMember, Constructor } from 'typedjson';
import { SerializableSetMemberOptions } from './options';
import { updateSerializableMember } from './utils';

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
        jsonSetMember(elementConstructor, options)(target, propertyKey);
        updateSerializableMember(target, propertyKey, options);
    };
}
