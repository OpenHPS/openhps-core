import { SerializableObject } from "../../data/decorators";
import { LengthUnit } from "./LengthUnit";
import { TimeUnit } from "./TimeUnit";
import { Unit } from "./Unit";

@SerializableObject()
export class SpeedUnit<L extends LengthUnit, T extends TimeUnit> extends Unit {
    
    constructor(toReference?: (x: number) => number, fromReference?: (x: number) => number) {
        super(toReference, fromReference);
    }

}
