import { Orientation } from './Orientation';
import { AngleUnit, Quaternion } from '../../utils';
import { SerializableObject } from '../decorators';
import { RelativePosition } from './RelativePosition';
import { Accuracy } from '../values';
import * as THREE from '../../utils/math/_internal';

/**
 * Relative orientation relative to another object. This indicates the rotation
 * relative to another reference object.
 */
@SerializableObject()
export class RelativeOrientation extends RelativePosition<Orientation, AngleUnit> {
    constructor(referenceObject?: any, orientation?: Orientation) {
        super(referenceObject, orientation, AngleUnit.DEGREE);
    }

    /**
     * Orientation accuracy
     * @returns {Accuracy} Position accuracy
     */
    get accuracy(): Accuracy<AngleUnit, any> {
        return this.referenceValue.accuracy;
    }

    set accuracy(value: Accuracy<AngleUnit, any>) {
        if (!value) {
            throw new Error(`Accuracy can not be undefined!`);
        }
        this.referenceValue.accuracy = value;
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
