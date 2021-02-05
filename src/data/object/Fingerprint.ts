import { SerializableObject } from '../decorators';
import { DataObject } from '.';
import { v4 as uuidv4 } from 'uuid';

@SerializableObject()
export class Fingerprint extends DataObject {
    constructor(displayName?: string) {
        super(uuidv4(), displayName);
    }
}
