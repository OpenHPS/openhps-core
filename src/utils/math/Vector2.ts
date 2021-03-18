import { SerializableObject, SerializableMember } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Vector2
 */
@SerializableObject()
export class Vector2 extends THREE.Vector2 {
    @SerializableMember()
    public x: number;

    @SerializableMember()
    public y: number;

    public static fromArray(array: number[]): Vector2 {
        return new this().fromArray(array);
    }

    public clone(): this {
        return new (this.constructor as new () => this)().copy(this) as this;
    }
}
