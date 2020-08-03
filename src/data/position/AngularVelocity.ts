import { AngularVelocityUnit } from "../../utils/unit/AngularVelocityUnit";
import { SerializableObject } from "../decorators";
import { Quaternion } from "../../utils";
import { Vector3 } from "../../utils/math/Vector3";

@SerializableObject()
export class AngularVelocity extends Vector3 {

    constructor(x?: number, y?: number, z?: number, unit: AngularVelocityUnit<any, any> = AngularVelocityUnit.RADIANS_PER_SECOND) {
        super(
            unit.convert(x ? x : 0, AngularVelocityUnit.RADIANS_PER_SECOND),
            unit.convert(y ? y : 0, AngularVelocityUnit.RADIANS_PER_SECOND),
            unit.convert(z ? z : 0, AngularVelocityUnit.RADIANS_PER_SECOND)
        );
    }

    public static fromVector(vector: number[], unit: AngularVelocityUnit<any, any> = AngularVelocityUnit.RADIANS_PER_SECOND): AngularVelocity {
        return new AngularVelocity(vector[0], vector[1], vector[2], unit);
    }

    public toVector(unit?: AngularVelocityUnit<any, any>): number [] {
        if (unit === undefined || unit === AngularVelocityUnit.RADIANS_PER_SECOND) {
            return [this.x, this.y, this.z];
        } else {
            return [AngularVelocityUnit.RADIANS_PER_SECOND.convert(this.x, unit), 
                AngularVelocityUnit.RADIANS_PER_SECOND.convert(this.y, unit), 
                AngularVelocityUnit.RADIANS_PER_SECOND.convert(this.z, unit)];
        }
    }

    public toRotationMatrix(): number[][] {
        return Quaternion.fromEuler({ x: this[0], y: this[1], z: this[2], order: 'ZYX' }).toRotationMatrix();
    }    
}
