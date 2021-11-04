import { jsonArrayMember, IJsonArrayMemberOptions, Serializable } from 'typedjson';
import { injectMemberOptions } from './utils';

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

        // Inject additional options if available
        if (options) {
            injectMemberOptions(target, propertyKey, options);
        }
    };
}

export interface SerializableArrayMemberOptions extends IJsonArrayMemberOptions {}
