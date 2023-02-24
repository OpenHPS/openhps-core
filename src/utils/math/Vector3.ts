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

    static fromArray<T extends Vector3>(this: new (...args: any[]) => T, array: number[]): T {
        return new this().fromArray(array) as T;
    }

    static fromVector<T extends Vector3>(this: new (...args: any[]) => T, vector: Vector3): T {
        return new this(vector.x, vector.y, vector.z) as T;
    }

    clone(): this {
        return new (this.constructor as new () => this)().copy(this) as this;
    }
}
