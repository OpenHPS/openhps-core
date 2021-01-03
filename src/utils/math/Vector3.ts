import { SerializableObject, SerializableMember } from '../../data/decorators';
import { Unit } from '../unit';
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

    constructor(x?: number, y?: number, z?: number, unit?: Unit, defaultUnit?: Unit) {
        if (unit && defaultUnit) {
            super(
                unit.convert(x ? x : 0, defaultUnit),
                unit.convert(y ? y : 0, defaultUnit),
                unit.convert(z ? z : 0, defaultUnit),
            );
        } else {
            super(x, y, z);
        }
    }

    public static fromArray(array: number[]): Vector3 {
        const vector = new Vector3();
        vector.fromArray(array);
        return vector;
    }
}
