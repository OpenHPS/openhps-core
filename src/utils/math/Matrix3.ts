import { SerializableArrayMember, SerializableObject } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Matrix3
 */
@SerializableObject()
export class Matrix3 extends THREE.Matrix3 {
    @SerializableArrayMember(Number)
    public elements: number[];

    public clone(): this {
        return new Matrix3().fromArray(this.elements) as this;
    }
}
