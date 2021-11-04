import { JsonObjectMetadata } from 'typedjson';
import { JsonMemberMetadata } from 'typedjson/lib/types/metadata';

/**
 * @param target
 * @param propertyKey
 * @param options
 */
export function injectMemberOptions(target: unknown, propertyKey: PropertyKey, options: any) {
    const meta = JsonObjectMetadata.ensurePresentInPrototype(target);
    const existingOptions = meta.dataMembers.get(propertyKey.toString()) || meta.dataMembers.get(options.name);
    meta.dataMembers.set(existingOptions.name, {
        ...options,
        ...existingOptions,
    } as JsonMemberMetadata);
}
