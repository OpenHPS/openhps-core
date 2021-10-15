import { Quaternion } from '../../utils/math';
import { SerializableMember, SerializableObject } from '../decorators';
import * as THREE from '../../utils/math/_internal';
import { TimeService } from '../../service/TimeService';
import { Accuracy } from '../values/Accuracy';
import { AngleUnit } from '../../utils';

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
    timestamp: number;
    @SerializableMember({
        isRequired: false,
    })
    accuracy!: Accuracy;

    constructor(x?: number, y?: number, z?: number, w?: number, accuracy?: Accuracy) {
        super(x, y, z, w);
        this.accuracy = accuracy || new Accuracy(0, AngleUnit.RADIAN);
        this.timestamp = TimeService.now();
    }

    static fromQuaternion(quat: Quaternion | THREE.Quaternion): Orientation {
        return new Orientation(quat.x, quat.y, quat.z, quat.w);
    }

    clone(): this {
        const vector = super.clone();
        vector.accuracy = this.accuracy;
        vector.timestamp = this.timestamp;
        return vector as this;
    }
}
