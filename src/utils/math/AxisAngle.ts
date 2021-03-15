import { AngleUnit } from '../unit';
import { SerializableObject, SerializableMember } from '../../data/decorators';
import { Matrix4 } from './Matrix4';
import { Vector3 } from './Vector3';
import * as THREE from './_internal';

/**
 * Axis-angle rotation
 */
@SerializableObject()
export class AxisAngle extends Vector3 {
    @SerializableMember()
    public angle: number;

    constructor(x?: number, y?: number, z?: number, angle: number = null, unit: AngleUnit = AngleUnit.RADIAN) {
        super(
            unit.convert(x ? x : 0, AngleUnit.RADIAN),
            unit.convert(y ? y : 0, AngleUnit.RADIAN),
            unit.convert(z ? z : 0, AngleUnit.RADIAN),
        );

        if (angle !== null) {
            this.angle = unit.convert(angle, AngleUnit.RADIAN);
        } else {
            this.angle = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
            this.normalize();
        }
    }

    /**
     * Convert quaternion to axis angles
     *
     * @param {THREE.Quaternion} quat Quaternion
     * @returns {AxisAngle} Axis angle instance
     */
    public static fromQuaternion(quat: THREE.Quaternion): AxisAngle {
        const axis = new AxisAngle();
        axis.angle = 2 * Math.acos(quat.w);
        if (1 - quat.w * quat.w < 0.000001) {
            axis.x = quat.x;
            axis.y = quat.y;
            axis.z = quat.z;
        } else {
            // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/
            const s = Math.sqrt(1 - quat.w * quat.w);
            axis.x = quat.x / s;
            axis.y = quat.y / s;
            axis.z = quat.z / s;
        }
        return axis;
    }

    /**
     * Convert axis angle to rotation matrix
     *
     * @returns {Matrix4} Rotation matrix
     */
    public toRotationMatrix(): Matrix4 {
        return Matrix4.rotationFromAxisAngle(this, this.angle);
    }

    public clone(): this {
        const vector = new AxisAngle().copy(this) as this;
        vector.angle = this.angle;
        return vector;
    }
}
