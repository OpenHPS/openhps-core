import { Vector2 } from "./Vector2";
import { SerializableObject, SerializableMember } from "../../data/decorators";
import { Unit } from "../unit";

@SerializableObject()
export class Vector3 extends Vector2 {

    constructor(x?: number, y?: number, z?: number) {
        super(x, y);
        this.z = z ? z : 0;
    }

    @SerializableMember()
    public get z(): number {
        return this[2];
    }

    public set z(value: number) {
        this[2] = value;
    }

    public toVector(fromUnit?: Unit, toUnit?: Unit): number [] {
        if (fromUnit === undefined || toUnit === undefined || fromUnit.hash === toUnit.hash) {
            return [this.x, this.y, this.z];
        } else {
            return [fromUnit.convert(this.x, toUnit), 
                fromUnit.convert(this.y, toUnit), 
                fromUnit.convert(this.z, toUnit)];
        }
    }

}
