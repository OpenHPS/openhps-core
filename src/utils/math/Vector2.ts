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
        const vector = new Vector2();
        vector.fromArray(array);
        return vector;
    }
}
