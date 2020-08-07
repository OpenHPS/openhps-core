import { SerializableObject, SerializableMember } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Vector2
 */
@SerializableObject()
export class Vector2 extends THREE.Vector2 {

    @SerializableMember()
    public get x(): number {
        return super.x;
    }

    public set x(value: number) {
        super.x = value;
    }

    @SerializableMember()
    public get y(): number {
        return super.y;
    }

    public set y(value: number) {
        super.y = value;
    }

    public static fromArray(array: number[]): Vector2 {
        const vector = new Vector2();
        vector.fromArray(array);
        return vector;
    }

}
