import { jsonArrayMember, Serializable } from 'typedjson';
import { SerializableArrayMemberOptions } from './options';
import { DataSerializerUtils } from '../DataSerializerUtils';

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
        const finalOptions = DataSerializerUtils.mergeMemberOptions(target, propertyKey, options);
        jsonArrayMember(elementConstructor, finalOptions)(target, propertyKey);
        DataSerializerUtils.updateMemberOptions(target, propertyKey, finalOptions);
    };
}
