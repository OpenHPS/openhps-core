import { SerializableObject, SerializableMember } from '../../data/decorators';
import * as THREE from './_internal';

/**
 * Serializable THREE.js Vector4
 */
@SerializableObject()
export class Vector4 extends THREE.Vector4 {

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

    @SerializableMember()
    public get w(): number {
        return super.w;
    }

    public set w(value: number) {
        super.w = value;
    }

    public static fromArray(array: number[]): Vector4 {
        const vector = new Vector4();
        vector.fromArray(array);
        return vector;
    }

}
