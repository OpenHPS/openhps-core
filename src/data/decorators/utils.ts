import { JsonObjectMetadata } from 'typedjson';
import { JsonMemberMetadata } from 'typedjson/lib/types/metadata';

/**
 * Inject member options into object
 *
 * @param {any} target Prototype
 * @param {PropertyKey} propertyKey Property key
 * @param {any} options Options to inject
 */
export function injectMemberOptions(target: unknown, propertyKey: PropertyKey, options: any) {
    const meta = JsonObjectMetadata.ensurePresentInPrototype(target);
    const existingOptions = meta.dataMembers.get(propertyKey.toString()) || meta.dataMembers.get(options.name);
    meta.dataMembers.set(existingOptions.name, {
        ...options,
        ...existingOptions,
    } as JsonMemberMetadata);
}
