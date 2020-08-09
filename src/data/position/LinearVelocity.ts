import { SerializableObject } from "../decorators";
import { LinearVelocityUnit } from "../../utils";
import { Vector3 } from "../../utils/math";

@SerializableObject()
export class LinearVelocity extends Vector3 {

    constructor(x?: number, y?: number, z?: number, unit: LinearVelocityUnit = LinearVelocityUnit.METER_PER_SECOND) {
        super(
            unit.convert(x, LinearVelocityUnit.METER_PER_SECOND),
            unit.convert(y, LinearVelocityUnit.METER_PER_SECOND),
            unit.convert(z, LinearVelocityUnit.METER_PER_SECOND)
        );
    }

    public static fromArray(array: number[], unit: LinearVelocityUnit = LinearVelocityUnit.METER_PER_SECOND): LinearVelocity {
        return new LinearVelocity(array[0], array[1], array[2], unit);
    }

}
