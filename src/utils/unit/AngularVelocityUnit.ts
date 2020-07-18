import { SerializableObject } from "../../data/decorators";
import { TimeUnit } from "./TimeUnit";
import { Unit } from "./Unit";
import { AngleUnit } from "./AngleUnit";

@SerializableObject()
export class AngularVelocityUnit<L extends AngleUnit, T extends TimeUnit> extends Unit {
    public static readonly RADIANS_PER_SECOND = new AngularVelocityUnit((x) => x, (x) => x);
    // public static readonly DEGREES_PER_SECOND = new AngularVelocityUnit((x) )
    
    constructor(toReference?: (x: number) => number, fromReference?: (x: number) => number) {
        super(toReference, fromReference);
    }

}
