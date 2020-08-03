import { SerializableObject } from "../decorators";
import { LinearVelocityUnit } from "../../utils";
import { Vector3 } from "../../utils/math/Vector3";

@SerializableObject()
export class LinearVelocity extends Vector3 {

    constructor(x?: number, y?: number, z?: number, unit: LinearVelocityUnit<any, any> = LinearVelocityUnit.METERS_PER_SECOND) {
        super(
            unit.convert(x, LinearVelocityUnit.METERS_PER_SECOND),
            unit.convert(y, LinearVelocityUnit.METERS_PER_SECOND),
            unit.convert(z, LinearVelocityUnit.METERS_PER_SECOND)
        );
    }

    public static fromVector(vector: number[], unit: LinearVelocityUnit<any, any> = LinearVelocityUnit.METERS_PER_SECOND): LinearVelocity {
        return new LinearVelocity(vector[0], vector[1], vector[2], unit);
    }

    public toVector(unit?: LinearVelocityUnit<any, any>): number [] {
        return super.toVector(LinearVelocityUnit.METERS_PER_SECOND, unit);
    }

    public toTranslationMatrix(): number[][] {
        return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [this.x, this.y, this.z, 1]
        ];
    }
}
