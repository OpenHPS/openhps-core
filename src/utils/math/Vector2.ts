import { SerializableObject, SerializableMember } from "../../data/decorators";
import { Unit } from "../unit";

@SerializableObject()
export class Vector2 extends Array<number> {

    constructor(x?: number, y?: number) {
        super();
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }

    @SerializableMember()
    public get x(): number {
        return this[0];
    }

    public set x(value: number) {
        this[0] = value;
    }

    @SerializableMember()
    public get y(): number {
        return this[1];
    }

    public set y(value: number) {
        this[1] = value;
    }

    public toVector(fromUnit?: Unit, toUnit?: Unit): number [] {
        if (fromUnit === undefined || fromUnit === toUnit) {
            return [this.x, this.y];
        } else {
            return [fromUnit.convert(this.x, toUnit), 
                fromUnit.convert(this.y, toUnit)];
        }
    }

}
