import { jsonSetMember, Constructor } from 'typedjson';
import { SerializableSetMemberOptions } from './options';
import { injectMemberOptions } from './utils';

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

        // Inject additional options if available
        if (options) {
            injectMemberOptions(target, propertyKey, options);
        }
    };
}
