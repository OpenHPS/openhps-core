import { SerializableObject, SerializableMember, NumberType } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Vector3
 */
@SerializableObject()
export class Vector3 extends THREE.Vector3 {
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

    static fromArray(array: number[]): Vector3 {
        return new this().fromArray(array);
    }

    clone(): this {
        return new (this.constructor as new () => this)().copy(this) as this;
    }
}
