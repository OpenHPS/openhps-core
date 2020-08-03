import { Vector3 } from "./Vector3";
import { SerializableMember, SerializableObject } from "../../data/decorators";

@SerializableObject()
export class Vector4 extends Vector3 {

    constructor(x?: number, y?: number, z?: number, w?: number) {
        super(x, y, z);
        this.w = w ? w : 1;
    }

    @SerializableMember()
    public get w(): number {
        return this[3];
    }

    public set w(value: number) {
        this[3] = value;
    }

}
