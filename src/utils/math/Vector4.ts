import { SerializableObject, SerializableMember } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Vector4
 */
@SerializableObject()
export class Vector4 extends THREE.Vector4 {
    @SerializableMember()
    public x: number;

    @SerializableMember()
    public y: number;

    @SerializableMember()
    public z: number;

    @SerializableMember()
    public w: number;

    public static fromArray(array: number[]): Vector4 {
        const vector = new Vector4();
        vector.fromArray(array);
        return vector;
    }
}
