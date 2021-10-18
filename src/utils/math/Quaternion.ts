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
    x: number;

    @SerializableMember()
    y: number;

    @SerializableMember()
    z: number;

    @SerializableMember()
    w: number;

    /**
     * Convert a threejs quaternion to serializable quaternion
     *
     * @param {THREE.Quaternion} threeQuaternion ThreeJS created quaternion
     * @returns {Quaternion} Serializable quaternion
     */
    static fromThreeJS<T extends typeof Quaternion>(threeQuaternion: THREE.Quaternion): InstanceType<T> {
        const quaternion = new this();
        quaternion.x = threeQuaternion.x;
        quaternion.y = threeQuaternion.y;
        quaternion.z = threeQuaternion.z;
        quaternion.w = threeQuaternion.w;
        return quaternion as InstanceType<T>;
    }

    /**
     * Convert euler angles to quaternion
     *
     * @param {Vector3 | Euler} euler Euler vector
     * @returns {Quaternion} Serializable quaternion
     */
    static fromEuler<T extends typeof Quaternion>(this: T, euler: Vector3): InstanceType<T>;
    static fromEuler<T extends typeof Quaternion>(this: T, euler: Euler): InstanceType<T>;
    static fromEuler<T extends typeof Quaternion>(
        this: T,
        euler: {
            yaw: number;
            pitch: number;
            roll: number;
            unit?: AngleUnit;
        },
    ): InstanceType<T>;
    static fromEuler<T extends typeof Quaternion>(
        this: T,
        euler: {
            x: number;
            y: number;
            z: number;
            order?: EulerOrder;
            unit?: AngleUnit;
        },
    ): InstanceType<T>;
    static fromEuler<T extends typeof Quaternion>(this: T, euler: number[]): InstanceType<T>;
    static fromEuler<T extends typeof Quaternion>(this: T, euler: any): InstanceType<T> {
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
        return quaternion as InstanceType<T>;
    }

    /**
     * Convert axis angle rotation to quaternion
     *
     * @param {any} axis Axis-angle rotation
     * @returns {Quaternion} Serializable quaternion
     */
    static fromAxisAngle<T extends typeof Quaternion>(
        this: T,
        axis: {
            x: number;
            y: number;
            z: number;
            angle?: number;
            unit?: AngleUnit;
        },
    ): InstanceType<T>;
    static fromAxisAngle<T extends typeof Quaternion>(this: T, axis: number[]): InstanceType<T>;
    static fromAxisAngle<T extends typeof Quaternion>(this: T, axis: AxisAngle): InstanceType<T>;
    static fromAxisAngle<T extends typeof Quaternion>(this: T, axis: any): InstanceType<T> {
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
        return quaternion as InstanceType<T>;
    }

    /**
     * Convert rotation matrix to quaternion
     *
     * @param {Quaternion} this This type
     * @param {Matrix4} matrix Rotation matrix
     * @returns {Quaternion} Serializable quaternion
     */
    static fromRotationMatrix<T extends typeof Quaternion>(this: T, matrix: Matrix4): InstanceType<T> {
        const quaternion = new this();
        quaternion.setFromRotationMatrix(matrix);
        return quaternion as InstanceType<T>;
    }

    /**
     * Convert the quaternion to euler angles
     *
     * @param {EulerOrder} order Euler order
     * @returns {Euler} Converted euler
     */
    toEuler(order?: EulerOrder): Euler {
        return Euler.fromQuaternion(this, order);
    }

    /**
     * Convert the quaternion to axis angles
     *
     * @returns {AxisAngle} Converted axis angle
     */
    toAxisAngle(): AxisAngle {
        return AxisAngle.fromQuaternion(this);
    }

    /**
     * Convert quaternion to rotation matrix
     *
     * @returns {Matrix4} Rotation matrix
     */
    toRotationMatrix(): Matrix4 {
        return Matrix4.rotationFromQuaternion(this);
    }

    clone(): this {
        return new (this.constructor as new () => this)().copy(this) as this;
    }
}
