import { SerializableObject, SerializableMember } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Vector4
 */
@SerializableObject()
export class Vector4 extends THREE.Vector4 {
    @SerializableMember()
    x: number;

    @SerializableMember()
    y: number;

    @SerializableMember()
    z: number;

    @SerializableMember()
    w: number;

    public static fromArray(array: number[]): Vector4 {
        return new this().fromArray(array);
    }

    public clone(): this {
        return new (this.constructor as new () => this)().copy(this) as this;
    }
}
