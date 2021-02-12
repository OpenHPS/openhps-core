import { SerializableMember, SerializableObject } from '../decorators';
import { DataObject } from '.';
import { v4 as uuidv4 } from 'uuid';
import { RelativePosition } from '../position';

@SerializableObject()
export class Fingerprint extends DataObject {
    public vector: number[];
    @SerializableMember()
    public classifier: string;

    constructor(displayName?: string) {
        super(uuidv4(), displayName);
    }

    /**
     * Set the fingerprint source. This can be used to identify the
     * user or device that captured the data.
     *
     * @param {DataObject} obj Fingerprint source
     */
    public set source(obj: DataObject) {
        this.parentUID = obj.uid;
    }

    /**
     * Compute the relative position vector from the relative positions
     */
    public computeVector(): void {
        this.vector = [];
        super.relativePositions
            // Sort alphabetically
            .sort((a: RelativePosition, b: RelativePosition) =>
                a.referenceObjectUID.localeCompare(b.referenceObjectUID),
            )
            .map((relativePosition) => {
                this.vector.push(relativePosition.referenceValue);
            });
    }
}
