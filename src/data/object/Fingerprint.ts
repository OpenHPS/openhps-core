import { SerializableMember, SerializableObject } from '../decorators';
import { DataObject } from '.';
import { v4 as uuidv4 } from 'uuid';

@SerializableObject()
export class Fingerprint extends DataObject {
    @SerializableMember()
    public classifier: string;

    constructor(classifier?: string, displayName?: string) {
        super(uuidv4(), displayName);
        this.classifier = classifier;
    }

    /**
     * Set the fingerprint source. This can be used to identify the
     * user that captured the data.
     *
     * @param {DataObject} obj Fingerprint source
     */
    public set source(obj: DataObject) {
        this.parentUID = obj.uid;
    }
}
