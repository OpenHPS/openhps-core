import { SerializableArrayMember, SerializableObject } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Matrix4
 */
@SerializableObject()
export class Matrix4 extends THREE.Matrix4 {
    @SerializableArrayMember(Number)
    public elements: number[];

    public static round(value: Matrix4, decimals = 0): Matrix4 {
        const pow = Math.pow(10, decimals);
        value.elements.forEach((e, i) => {
            value.elements[i] = Math.round(e * pow) / pow;
        });
        return value;
    }

    /**
     * Create a matrix from array
     * @param {number[][]} array Array
     * @returns {Matrix4} Matrix4
     */
    public static fromArray<T extends Matrix4>(array: number[][]): T {
        const matrix = new this();
        matrix.fromArray([].concat(...array));
        matrix.transpose();
        return matrix as T;
    }

    /**
     * Create a rotation matrix from quaternion
     * @param {THREE.Quaternion} quat Quaternion
     * @returns {Matrix4} Rotation matrix
     */
    public static rotationFromQuaternion<T extends Matrix4>(quat: THREE.Quaternion): T {
        const matrix = new this();
        matrix.makeRotationFromQuaternion(quat);
        return matrix as T;
    }

    /**
     * Create a rotation matrix from euler angles
     * @param {THREE.Euler} euler Euler angles
     * @returns {Matrix4} Rotation matrix
     */
    public static rotationFromEuler<T extends Matrix4>(euler: THREE.Euler): T {
        const matrix = new this();
        matrix.makeRotationFromEuler(euler);
        return matrix as T;
    }

    /**
     * Create a rotation matrix from euler angles
     * @param {THREE.Vector3} vector Vector
     * @param {number} angle Angle
     * @returns {Matrix4} Rotation matrix
     */
    public static rotationFromAxisAngle<T extends Matrix4>(vector: THREE.Vector3, angle: number): T {
        const matrix = new this();
        matrix.makeRotationAxis(vector, angle);
        return matrix as T;
    }

    public clone(): this {
        return new (this.constructor as new () => this)().fromArray(this.elements) as this;
    }
}
