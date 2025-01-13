import 'reflect-metadata';
import { jsonMember, IndexedObject } from 'typedjson';
import { SerializableMemberOptions } from './options';
import { DataSerializerUtils } from '../DataSerializerUtils';

/**
 * @param {SerializableMemberOptions} [options] Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableMember(options?: SerializableMemberOptions | IndexedObject): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        const finalOptions = DataSerializerUtils.mergeMemberOptions(target, propertyKey, options);
        jsonMember(finalOptions)(target, propertyKey);
        DataSerializerUtils.updateMemberOptions(target, propertyKey, finalOptions);
    };
}
