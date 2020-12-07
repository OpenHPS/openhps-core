import { Quaternion } from '../../utils/math';
import { SerializableMember, SerializableObject } from '../decorators';

/**
 * Orientation quaternion with accuracy
 */
@SerializableObject()
export class Orientation extends Quaternion {
    @SerializableMember({
        isRequired: false,
    })
    public accuracy: number;

    constructor(quat: Quaternion, accuracy?: number) {
        super(quat.x, quat.y, quat.z);
        this.accuracy = accuracy;
    }
}
