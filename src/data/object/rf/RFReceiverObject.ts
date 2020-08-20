import { RFObject } from './RFObject';
import { SerializableObject, SerializableMember } from '../../decorators';
import { DataObject } from '../DataObject';

@SerializableObject()
export class RFReceiverObject extends DataObject implements RFObject {
    public _rfSensitivity: number;

    /**
     * Get RF sensitivity
     */
    @SerializableMember()
    public get rxSensitivty(): number {
        return this._rfSensitivity;
    }

    /**
     * Set RF sensitivity
     *
     * @param sensitivity RF sensitivity
     */
    public set rxSensitivity(sensitivity: number) {
        this._rfSensitivity = sensitivity;
    }
}
