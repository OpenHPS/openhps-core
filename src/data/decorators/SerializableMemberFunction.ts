import { SerializableMemberOptions } from './options';
import { SerializableMember } from './SerializableMember';

/**
 * @param {SerializableMemberOptions} [options] Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableMemberFunction(options: SerializableMemberOptions = {}): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        options.serializer = (fn) => fn.toString();
        options.deserializer = (fnStr) => eval(fnStr);
        SerializableMember(options)(target, propertyKey);
    };
}
