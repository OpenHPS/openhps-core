import { AngularVelocityUnit } from "../../utils/unit/AngularVelocityUnit";
import { SerializableObject } from "../decorators";
import { Vector3 } from "../../utils/math";

@SerializableObject()
export class AngularVelocity extends Vector3 {

    constructor(x?: number, y?: number, z?: number, unit: AngularVelocityUnit = AngularVelocityUnit.RADIAN_PER_SECOND) {
        super(
            unit.convert(x ? x : 0, AngularVelocityUnit.RADIAN_PER_SECOND),
            unit.convert(y ? y : 0, AngularVelocityUnit.RADIAN_PER_SECOND),
            unit.convert(z ? z : 0, AngularVelocityUnit.RADIAN_PER_SECOND)
        );
    }

    public static fromArray(array: number[], unit: AngularVelocityUnit = AngularVelocityUnit.RADIAN_PER_SECOND): AngularVelocity {
        return new AngularVelocity(array[0], array[1], array[2], unit);
    }

}
