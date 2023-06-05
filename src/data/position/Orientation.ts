import { Quaternion } from '../../utils/math';
import { NumberType, SerializableMember, SerializableObject } from '../decorators';
import * as THREE from '../../utils/math/_internal';
import { TimeService } from '../../service/TimeService';
import { Accuracy } from '../values/Accuracy';
import { AngleUnit } from '../../utils';
import { Accuracy1D } from '../values/Accuracy1D';

/**
 * Orientation quaternion with accuracy
 * @category Position
 */
@SerializableObject()
export class Orientation extends Quaternion {
    @SerializableMember({
        isRequired: false,
        numberType: NumberType.LONG,
    })
    timestamp: number;
    @SerializableMember({
        isRequired: false,
    })
    accuracy!: Accuracy<AngleUnit, number>;

    constructor(x?: number, y?: number, z?: number, w?: number, accuracy?: Accuracy<AngleUnit, number>) {
        super(x, y, z, w);
        this.accuracy = accuracy || new Accuracy1D(0, AngleUnit.RADIAN);
        this.timestamp = TimeService.now();
    }

    static fromQuaternion(quat: Quaternion | THREE.Quaternion): Orientation {
        return new Orientation(quat.x, quat.y, quat.z, quat.w);
    }

    clone(): this {
        const vector = super.clone();
        vector.accuracy = this.accuracy ? this.accuracy.clone() : undefined;
        vector.timestamp = this.timestamp;
        return vector as this;
    }
}
