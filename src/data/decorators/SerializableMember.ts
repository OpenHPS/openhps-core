import { jsonMember, IJsonMemberOptions, JsonObjectMetadata } from 'typedjson';
import { JsonMemberMetadata } from 'typedjson/lib/types/metadata';

/**
 * @param {IJsonMemberOptions} [options] Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableMember(options?: SerializableMemberOptions): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        jsonMember(options)(target, propertyKey);
        // Inject additional options if available
        if (options) {
            const meta = JsonObjectMetadata.ensurePresentInPrototype(target);
            const existingOptions = meta.dataMembers.get(propertyKey) || meta.dataMembers.get(options.name);
            options.index = options.index || options.primaryKey;
            meta.dataMembers.set(propertyKey, {
                ...options,
                ...existingOptions,
            } as JsonMemberMetadata);
        }
    };
}

export interface SerializableMemberOptions extends IJsonMemberOptions {
    /**
     * Identify this attribute as unique
     */
    unique?: boolean;
    /**
     * Identify this attribute as a primary key
     */
    primaryKey?: boolean;
    /**
     * Create an index on this attribute. Possible values
     * are true/false or a string for specifying this attribute
     * as part of multiple attributes in an index.
     */
    index?: string | boolean;
}
