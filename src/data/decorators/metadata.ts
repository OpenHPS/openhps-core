import { JsonObjectMetadata } from 'typedjson';
import type { JsonMemberMetadata } from 'typedjson/lib/types/metadata';
import { MemberOptionsBase, SerializableObjectOptions } from './options';

export interface ObjectMetadata extends JsonObjectMetadata {
    dataMembers: Map<string, ObjectMemberMetadata>;
    options?: SerializableObjectOptions<any>;
}

export interface ObjectMemberMetadata extends JsonMemberMetadata {
    options?: MemberOptionsBase;
}
