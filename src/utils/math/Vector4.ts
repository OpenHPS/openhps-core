import { SerializableObject, SerializableMember, NumberType } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Vector4
 */
@SerializableObject()
export class Vector4 extends THREE.Vector4 {
    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    x: number;

    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    y: number;

    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    z: number;

    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    w: number;

    static fromArray(array: number[]): Vector4 {
        return new this().fromArray(array);
    }

    clone(): this {
        return new (this.constructor as new () => this)().copy(this) as this;
    }
}
