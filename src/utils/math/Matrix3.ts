import { SerializableArrayMember, SerializableObject, NumberType } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Matrix3
 */
@SerializableObject()
export class Matrix3 extends THREE.Matrix3 {
    @SerializableArrayMember(Number, {
        numberType: NumberType.DECIMAL
    })
    public elements: number[];

    /**
     * Create a matrix from array
     * @param {number[][]} array Array
     * @returns {Matrix3} Matrix3
     */
    public static fromArray<T extends Matrix3>(array: number[][]): T {
        const matrix = new this();
        matrix.fromArray([].concat(...array));
        matrix.transpose();
        return matrix as T;
    }

    public clone(): this {
        return new (this.constructor as new () => this)().fromArray(this.elements) as this;
    }
}
