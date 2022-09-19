import { SerializableObject, SerializableMember, NumberType } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Vector2
 */
@SerializableObject()
export class Vector2 extends THREE.Vector2 {
    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    x: number;

    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    y: number;

    static fromArray(array: number[]): Vector2 {
        return new this().fromArray(array);
    }

    clone(): this {
        return new (this.constructor as new () => this)().copy(this) as this;
    }
}
