import { SerializableObject } from "../../data/decorators";
import { Unit } from "../unit";

@SerializableObject()
export class Vector extends Array<number> {

    public set(v: number[]): Vector {
        v.forEach((val, i) => this[i] = val);
        return this;
    }

    public toVector(fromUnit?: Unit, toUnit?: Unit): number[] {
        if (fromUnit === undefined || toUnit === undefined || fromUnit === toUnit) {
            return this;
        } else {
            const v = Array.from(this);
            v.map((val, i) => v[i] = fromUnit.convert(val, toUnit));
            return v;
        }
    }

}
