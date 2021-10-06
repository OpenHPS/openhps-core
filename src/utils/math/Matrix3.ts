import { SerializableArrayMember, SerializableObject } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Matrix3
 */
@SerializableObject()
export class Matrix3 extends THREE.Matrix3 {
    @SerializableArrayMember(Number)
    public elements: number[];

    /**
     * Create a matrix from array
     *
     * @param {number[][]} array Array
     * @returns {Matrix3} Matrix3
     */
    public static fromArray(array: number[][]): Matrix3 {
        const matrix = new this();
        matrix.fromArray([].concat(...array));
        matrix.transpose();
        return matrix;
    }

    public clone(): this {
        return new Matrix3().fromArray(this.elements) as this;
    }
}
