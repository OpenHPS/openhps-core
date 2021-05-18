import { jsonSetMember, IJsonSetMemberOptions, Constructor } from 'typedjson';

/**
 * @param {Constructor} elementConstructor Element constructor
 * @param {IJsonSetMemberOptions} options Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableSetMember<T>(
    elementConstructor: Constructor<T>,
    options?: IJsonSetMemberOptions,
): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        jsonSetMember(elementConstructor, options)(target, propertyKey);
    };
}
