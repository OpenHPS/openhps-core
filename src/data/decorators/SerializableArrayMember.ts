import { jsonArrayMember, Serializable } from 'typedjson';
import { SerializableArrayMemberOptions } from './options';
import { updateSerializableMember } from './utils';

export function SerializableArrayMember<T>(
    elementConstructor: Serializable<T>,
    options?: SerializableArrayMemberOptions,
): (target: unknown, propKey: string | symbol) => void;
/**
 * @param {Serializable<any>} elementConstructor Element constructor
 * @param {SerializableArrayMemberOptions} [options] Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableArrayMember<T>(
    elementConstructor: Serializable<T>,
    options?: SerializableArrayMemberOptions,
): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        jsonArrayMember(elementConstructor, options)(target, propertyKey);
        updateSerializableMember(target, propertyKey, options);
    };
}
