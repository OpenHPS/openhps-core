import { SerializableObject, SerializableMember } from '../../data/decorators';
import { Unit } from '../unit';
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

    constructor(x?: number, y?: number, unit?: Unit, defaultUnit?: Unit) {
        if (unit && defaultUnit) {
            super(unit.convert(x ? x : 0, defaultUnit), unit.convert(y ? y : 0, defaultUnit));
        } else {
            super(x, y);
        }
    }

    public static fromArray(array: number[]): Vector2 {
        return new this().fromArray(array);
    }

    public clone(): this {
        return new (this.constructor as new () => this)().copy(this) as this;
    }
}
