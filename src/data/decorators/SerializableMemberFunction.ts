import { SerializableMemberOptions } from './options';
import { SerializableMember } from './SerializableMember';
import { mergeMemberOptions, updateSerializableMember } from './utils';

/**
 * @param {SerializableMemberOptions} [options] Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableMemberFunction(options: SerializableMemberOptions = {}): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        options.serializer = (fn) => fn.toString();
        options.deserializer = (fnStr) => eval(fnStr);
        const finalOptions = mergeMemberOptions(target, propertyKey, options);
        SerializableMember(finalOptions)(target, propertyKey);
        updateSerializableMember(target, propertyKey, finalOptions);
    };
}
