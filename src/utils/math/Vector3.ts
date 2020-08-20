import { SerializableObject, SerializableMember } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Vector3
 */
@SerializableObject()
export class Vector3 extends THREE.Vector3 {
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

    @SerializableMember()
    public get z(): number {
        return super.z;
    }

    public set z(value: number) {
        super.z = value;
    }

    public static fromArray(array: number[]): Vector3 {
        const vector = new Vector3();
        vector.fromArray(array);
        return vector;
    }
}
