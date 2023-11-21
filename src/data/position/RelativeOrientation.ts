import { Orientation } from './Orientation';
import { Accuracy, Accuracy1D } from '../values';
import { AngleUnit, Quaternion } from '../../utils';
import { SerializableObject } from '../decorators';
import { RelativePosition } from './RelativePosition';

/**
 * Relative orientation relative to another object. This indicates the rotation
 * relative to another reference object.
 */
@SerializableObject()
export class RelativeOrientation extends RelativePosition<Orientation, AngleUnit> {
    constructor(
        referenceObject?: any,
        x?: number,
        y?: number,
        z?: number,
        w?: number,
        accuracy?: Accuracy<AngleUnit, number>,
    ) {
        super(referenceObject, new Orientation(), AngleUnit.DEGREE);
        this.referenceValue.x = x;
        this.referenceValue.y = y;
        this.referenceValue.z = z;
        this.referenceValue.w = w;
        this.accuracy = accuracy || new Accuracy1D(0, AngleUnit.RADIAN);
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
