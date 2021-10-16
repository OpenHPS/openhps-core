import { jsonMember, IJsonMemberOptions, JsonObjectMetadata, AnyT } from 'typedjson';
import { JsonMemberMetadata } from 'typedjson/lib/types/metadata';
import { DataSerializer } from '../DataSerializer';

/**
 * @param {IJsonMemberOptions} [options] Member options
 * @returns {PropertyDecorator} Property decorator
 */
export function SerializableMember(options?: SerializableMemberOptions): PropertyDecorator {
    return (target: unknown, propertyKey: string) => {
        jsonMember(options)(target, propertyKey);
        const reflectPropCtor: Function | null | undefined =
            Reflect.getMetadata('design:type', target, propertyKey);

        // Inject additional options if available
        if (options) {
            const meta = JsonObjectMetadata.ensurePresentInPrototype(target);
            const existingOptions = meta.dataMembers.get(propertyKey) || meta.dataMembers.get(options.name);
            options.index = options.index || options.primaryKey;
            meta.dataMembers.set(existingOptions.name, {
                ...options,
                ...existingOptions,
            } as JsonMemberMetadata);
        }

        // Detect generic types that have no deserialization or constructor specified
        if (reflectPropCtor === Object && (!options || (!options.deserializer && !Object.keys(options).includes('constructor')))) {
            const meta = JsonObjectMetadata.ensurePresentInPrototype(target);
            const existingOptions = meta.dataMembers.get(options ? options.name || propertyKey : propertyKey);
            existingOptions.deserializer = DataSerializer.deserialize.bind(DataSerializer);
            existingOptions.serializer = DataSerializer.serialize.bind(DataSerializer);
            existingOptions.type = () => AnyT;
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
