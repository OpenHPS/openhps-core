import { jsonSetMember, IJsonSetMemberOptions, Constructor } from 'typedjson';
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

export interface SerializableSetMemberOptions extends IJsonSetMemberOptions {}
