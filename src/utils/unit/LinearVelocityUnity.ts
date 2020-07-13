import { SerializableObject } from "../../data/decorators";
import { LengthUnit } from "./LengthUnit";
import { TimeUnit } from "./TimeUnit";
import { Unit } from "./Unit";

@SerializableObject({
    name: "LinearVelocityUnit"
})
export class LinearVelocityUnit<L extends LengthUnit, T extends TimeUnit> extends Unit {
    public static readonly METERS_PER_SECOND = new LinearVelocityUnit((x) => x, (x) => x);

    constructor(toReference?: (x: number) => number, fromReference?: (x: number) => number) {
        super(toReference, fromReference);
    }

}
