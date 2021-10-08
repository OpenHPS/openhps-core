import { SerializableObject, SerializableMember } from '../../data/decorators';
import * as THREE from './_internal';
import { Euler, EulerOrder } from './Euler';
import { Matrix4 } from './Matrix4';
import { AxisAngle } from './AxisAngle';
import { Vector3 } from './Vector3';
import { AngleUnit } from '../unit';

/**
 * Serializable THREE.js Quaternion
 */
@SerializableObject()
export class Quaternion extends THREE.Quaternion {
    @SerializableMember()
    public x: number;

    @SerializableMember()
    public y: number;

    @SerializableMember()
    public z: number;

    @SerializableMember()
    public w: number;

    /**
     * Convert a threejs quaternion to serializable quaternion
     *
     * @param {THREE.Quaternion} threeQuaternion ThreeJS created quaternion
     * @returns {Quaternion} Serializable quaternion
     */
    public static fromThreeJS<T extends Quaternion>(threeQuaternion: THREE.Quaternion): T {
        const quaternion = new this();
        quaternion.x = threeQuaternion.x;
        quaternion.y = threeQuaternion.y;
        quaternion.z = threeQuaternion.z;
        quaternion.w = threeQuaternion.w;
        return quaternion as T;
    }

    /**
     * Convert euler angles to quaternion
     *
     * @param {Vector3 | Euler} euler Euler vector
     * @returns {Quaternion} Serializable quaternion
     */
    public static fromEuler<T extends Quaternion>(euler: Vector3): T;
    public static fromEuler<T extends Quaternion>(euler: Euler): T;
    public static fromEuler<T extends Quaternion>(euler: {
        yaw: number;
        pitch: number;
        roll: number;
        unit?: AngleUnit;
    }): T;
    public static fromEuler<T extends Quaternion>(euler: {
        x: number;
        y: number;
        z: number;
        order?: EulerOrder;
        unit?: AngleUnit;
    }): T;
    public static fromEuler<T extends Quaternion>(euler: number[]): T;
    public static fromEuler<T extends Quaternion>(euler: any): T {
        const quaternion = new this();
        if (euler instanceof Euler) {
            quaternion.setFromEuler(euler);
        } else if (euler instanceof Vector3) {
            quaternion.setFromEuler(new Euler(euler.x, euler.y, euler.z));
        } else if (euler instanceof Array) {
            quaternion.setFromEuler(new Euler(euler[0], euler[1], euler[2]));
        } else if (euler['yaw'] === undefined) {
            quaternion.setFromEuler(new Euler(euler.x, euler.y, euler.z, euler.order, euler.unit));
        } else {
            quaternion.setFromEuler(new Euler(euler.roll, euler.pitch, euler.yaw, 'ZYX', euler.unit));
        }
        return quaternion as T;
    }

    /**
     * Convert axis angle rotation to quaternion
     *
     * @param {any} axis Axis-angle rotation
     * @returns {Quaternion} Serializable quaternion
     */
    public static fromAxisAngle<T extends Quaternion>(axis: {
        x: number;
        y: number;
        z: number;
        angle?: number;
        unit?: AngleUnit;
    }): T;
    public static fromAxisAngle<T extends Quaternion>(axis: number[]): T;
    public static fromAxisAngle<T extends Quaternion>(axis: AxisAngle): T;
    public static fromAxisAngle<T extends Quaternion>(axis: any): T {
        const quaternion = new this();
        if (axis instanceof AxisAngle) {
            quaternion.setFromAxisAngle(new Vector3(axis.x, axis.y, axis.z), axis.angle);
        } else if (axis instanceof Array) {
            const axisAngle = new AxisAngle(axis[0], axis[1], axis[2], axis.length === 4 ? axis[3] : null);
            quaternion.setFromAxisAngle(axisAngle, axisAngle.angle);
        } else {
            const axisAngle = new AxisAngle(axis.x, axis.y, axis.z, axis.angle ? axis.angle : null, axis.unit);
            quaternion.setFromAxisAngle(axisAngle, axisAngle.angle);
        }
        return quaternion as T;
    }

    /**
     * Convert rotation matrix to quaternion
     *
     * @param {Matrix4} matrix Rotation matrix
     * @returns {Quaternion} Serializable quaternion
     */
    public static fromRotationMatrix<T extends Quaternion>(matrix: Matrix4): T {
        const quaternion = new this();
        quaternion.setFromRotationMatrix(matrix);
        return quaternion as T;
    }

    /**
     * Convert the quaternion to euler angles
     *
     * @param {EulerOrder} order Euler order
     * @returns {Euler} Converted euler
     */
    public toEuler(order?: EulerOrder): Euler {
        return Euler.fromQuaternion(this, order);
    }

    /**
     * Convert the quaternion to axis angles
     *
     * @returns {AxisAngle} Converted axis angle
     */
    public toAxisAngle(): AxisAngle {
        return AxisAngle.fromQuaternion(this);
    }

    /**
     * Convert quaternion to rotation matrix
     *
     * @returns {Matrix4} Rotation matrix
     */
    public toRotationMatrix(): Matrix4 {
        return Matrix4.rotationFromQuaternion(this);
    }

    public clone(): this {
        return new (Object.getPrototypeOf(this).constructor)().copy(this) as this;
    }
}
