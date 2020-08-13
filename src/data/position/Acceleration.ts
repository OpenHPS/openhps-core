import { Vector3, AccelerationUnit } from "../../utils";
import { SerializableObject } from "../decorators";

@SerializableObject()
export class Acceleration extends Vector3 {

    constructor(x: number = 0, y: number = 0, z: number = 0, unit: AccelerationUnit = AccelerationUnit.METER_PER_SECOND_SQUARE) {
        super(
            unit.convert(x, AccelerationUnit.METER_PER_SECOND_SQUARE),
            unit.convert(y, AccelerationUnit.METER_PER_SECOND_SQUARE),
            unit.convert(z, AccelerationUnit.METER_PER_SECOND_SQUARE)
        );
    }

}
