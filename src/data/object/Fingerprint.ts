import { SerializableMember, SerializableObject } from '../decorators';
import { DataObject } from '.';
import { v4 as uuidv4 } from 'uuid';

@SerializableObject()
export class Fingerprint extends DataObject {
    @SerializableMember()
    public nodeUID: string;

    constructor(nodeUID?: string, displayName?: string) {
        super(uuidv4(), displayName);
        this.nodeUID = nodeUID;
    }
}
