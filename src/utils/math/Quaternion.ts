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
    public get x(): number {
        return super.x;
    }

    public set x(value: number) {
        super.x = value;
    }

    @SerializableMember()
    public get y(): number {
        return super.y;
    }

    public set y(value: number) {
        super.y = value;
    }

    @SerializableMember()
    public get z(): number {
        return super.z;
    }

    public set z(value: number) {
        super.z = value;
    }

    @SerializableMember()
    public get w(): number {
        return super.w;
    }

    public set w(value: number) {
        super.w = value;
    }

    /**
     * Convert a threejs quaternion to serializable quaternion
     *
     * @param {THREE.Quaternion} threeQuaternion ThreeJS created quaternion
     * @returns {Quaternion} Serializable quaternion
     */
    public static fromThreeJS(threeQuaternion: THREE.Quaternion): Quaternion {
        const quaternion = new Quaternion();
        quaternion.x = threeQuaternion.x;
        quaternion.y = threeQuaternion.y;
        quaternion.z = threeQuaternion.z;
        quaternion.w = threeQuaternion.w;
        return quaternion;
    }

    /**
     * Convert euler angles to quaternion
     *
     * @param {Vector3 | Euler} euler Euler vector
     * @returns {Quaternion} Serializable quaternion
     */
    public static fromEuler(euler: Vector3): Quaternion;
    public static fromEuler(euler: Euler): Quaternion;
    public static fromEuler(euler: { yaw: number; pitch: number; roll: number; unit?: AngleUnit }): Quaternion;
    public static fromEuler(euler: {
        x: number;
        y: number;
        z: number;
        order?: EulerOrder;
        unit?: AngleUnit;
    }): Quaternion;
    public static fromEuler(euler: number[]): Quaternion;
    public static fromEuler(euler: any): Quaternion {
        const quaternion = new Quaternion();
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
        return quaternion;
    }

    /**
     * Convert axis angle rotation to quaternion
     *
     * @param {any} axis Axis-angle rotation
     * @returns {Quaternion} Serializable quaternion
     */
    public static fromAxisAngle(axis: {
        x: number;
        y: number;
        z: number;
        angle?: number;
        unit?: AngleUnit;
    }): Quaternion;
    public static fromAxisAngle(axis: number[]): Quaternion;
    public static fromAxisAngle(axis: AxisAngle): Quaternion;
    public static fromAxisAngle(axis: any): Quaternion {
        const quaternion = new Quaternion();
        if (axis instanceof AxisAngle) {
            quaternion.setFromAxisAngle(new Vector3(axis.x, axis.y, axis.z), axis.angle);
        } else if (axis instanceof Array) {
            const axisAngle = new AxisAngle(axis[0], axis[1], axis[2], axis.length === 4 ? axis[3] : null);
            quaternion.setFromAxisAngle(axisAngle, axisAngle.angle);
        } else {
            const axisAngle = new AxisAngle(axis.x, axis.y, axis.z, axis.angle ? axis.angle : null, axis.unit);
            quaternion.setFromAxisAngle(axisAngle, axisAngle.angle);
        }
        return quaternion;
    }

    /**
     * Convert rotation matrix to quaternion
     *
     * @param {Matrix4} matrix Rotation matrix
     * @returns {Quaternion} Serializable quaternion
     */
    public static fromRotationMatrix(matrix: Matrix4): Quaternion {
        const quaternion = new Quaternion();
        quaternion.setFromRotationMatrix(matrix);
        return quaternion;
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
}
