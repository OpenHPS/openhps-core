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
            meta.dataMembers.set(propertyKey, {
                ...options,
                ...meta.dataMembers.get(propertyKey),
            } as JsonMemberMetadata);
        }
    };
}

export interface SerializableMemberOptions extends IJsonMemberOptions {
    unique?: boolean;
    primaryKey?: boolean;
    index?: string | boolean;
    type?: DataType;
}

export enum DataType {
    BIGINT,
    INTEGER,
    FLOAT,
    DOUBLE,
    REAL,
    DECIMAL,
}
