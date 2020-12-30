import { Quaternion } from '../../utils/math';
import { SerializableMember, SerializableObject } from '../decorators';
import * as THREE from '../../utils/math/_internal';

/**
 * Orientation quaternion with accuracy
 *
 * @category Position
 */
@SerializableObject()
export class Orientation extends Quaternion {
    @SerializableMember({
        isRequired: false,
    })
    public accuracy?: number;

    constructor(x?: number, y?: number, z?: number, w?: number, accuracy?: number) {
        super(x, y, z, w);
        this.accuracy = accuracy;
    }

    public static fromQuaternion(quat: Quaternion | THREE.Quaternion): Orientation {
        return new Orientation(quat.x, quat.y, quat.z, quat.w);
    }
}
