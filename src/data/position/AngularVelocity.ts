import { AngularVelocityUnit } from "../../utils/unit/AngularVelocityUnit";
import { SerializableObject } from "../decorators";
import { Vector3 } from "../../utils/math";

@SerializableObject()
export class AngularVelocity extends Vector3 {

    constructor(x?: number, y?: number, z?: number, unit: AngularVelocityUnit<any, any> = AngularVelocityUnit.RADIANS_PER_SECOND) {
        super(
            unit.convert(x ? x : 0, AngularVelocityUnit.RADIANS_PER_SECOND),
            unit.convert(y ? y : 0, AngularVelocityUnit.RADIANS_PER_SECOND),
            unit.convert(z ? z : 0, AngularVelocityUnit.RADIANS_PER_SECOND)
        );
    }

}
