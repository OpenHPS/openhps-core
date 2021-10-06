import { SerializableMember, SerializableObject } from '../decorators';
import { Acceleration, Magnetism } from '../position';
import { DataObject } from './DataObject';

@SerializableObject()
export class IMUSensorObject extends DataObject {
    @SerializableMember()
    frequency: number;
    @SerializableMember()
    magnetism: Magnetism;
    @SerializableMember()
    acceleration: Acceleration;
    @SerializableMember()
    linearAcceleration: Acceleration;
    @SerializableMember()
    gravity: Acceleration;
}
