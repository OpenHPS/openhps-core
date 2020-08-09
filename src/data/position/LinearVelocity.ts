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

}
