import { Vector2 } from "./Vector2";
import { SerializableObject, SerializableMember } from "../../data/decorators";

@SerializableObject()
export class Vector3 extends Vector2 {

    constructor(x?: number, y?: number, z?: number) {
        super(x, y);
        this.z = z ? z : 0;
    }

    public set(x: number, y: number, z: number): Vector3 {
        super.set(x, y);
        this.z = z;
        return this;
    }

    @SerializableMember()
    public get z(): number {
        return this[2];
    }

    public set z(value: number) {
        this[2] = value;
    }

}
