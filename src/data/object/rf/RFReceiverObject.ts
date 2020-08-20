import { RFObject } from './RFObject';
import { SerializableObject, SerializableMember } from '../../decorators';
import { DataObject } from '../DataObject';

@SerializableObject()
export class RFReceiverObject extends DataObject implements RFObject {
    /**
     * RF sensitivity
     */
    @SerializableMember()
    public rxSensitivity: number;
}
