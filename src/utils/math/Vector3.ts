import { SerializableObject, SerializableMember } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Vector3
 */
@SerializableObject()
export class Vector3 extends THREE.Vector3 {
    @SerializableMember()
    public x: number;

    @SerializableMember()
    public y: number;

    @SerializableMember()
    public z: number;

    public static fromArray(array: number[]): Vector3 {
        return new this().fromArray(array);
    }

    public clone(): this {
        return new (this.constructor as new () => this)().copy(this) as this;
    }
}
