import { jsonArrayMember, IJsonArrayMemberOptions, Serializable } from 'typedjson';

export function SerializableArrayMember<T>(
    elementConstructor: Serializable<T>,
    options?: IJsonArrayMemberOptions,
): (target: unknown, propKey: string | symbol) => void;
/**
 * @param {Serializable<any>} elementConstructor Element constructor
 * @param {IJsonArrayMemberOptions} [options] Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableArrayMember<T>(
    elementConstructor: Serializable<T>,
    options?: IJsonArrayMemberOptions,
): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        jsonArrayMember(elementConstructor, options)(target, propertyKey);
    };
}
