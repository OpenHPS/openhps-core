import { AngularVelocityUnit } from "../../utils/unit/AngularVelocityUnit";
import { SerializableObject, SerializableMember } from "../decorators";
import * as math from 'mathjs';

@SerializableObject()
export class AngularVelocity {
    @SerializableMember()
    public x: number;
    @SerializableMember()
    public y: number;
    @SerializableMember()
    public z: number;
    
    @SerializableMember()
    public unit: AngularVelocityUnit<any, any>;
    
    constructor(x: number = 0, y: number = 0, z: number = 0, unit: AngularVelocityUnit<any, any> = AngularVelocityUnit.RADIANS_PER_SECOND) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.unit = unit;
    }

    public static fromVector(vector: number[], unit: AngularVelocityUnit<any, any> = AngularVelocityUnit.RADIANS_PER_SECOND): AngularVelocity {
        return new AngularVelocity(vector[0], vector[1], vector[2], unit);
    }

    public toVector(unit?: AngularVelocityUnit<any, any>): number [] {
        if (unit === undefined) {
            return [this.x, this.y, this.z];
        } else {
            return [this.unit.convert(this.x, unit), 
                this.unit.convert(this.y, unit), 
                this.unit.convert(this.z, unit)];
        }
    }

    public toRotationMatrix(): number[][] {
        const v = this.toVector(AngularVelocityUnit.RADIANS_PER_SECOND);
        const rotMatrixZ = [
            [1, 0, 0, 0],
            [0, Math.cos(v[2]), -Math.sin(v[2]), 0],
            [0, Math.sin(v[2]), Math.cos(v[2]), 0],
            [0, 0, 0, 1]
        ];
        const rotMatrixY = [
            [Math.cos(v[1]), 0, Math.sin(v[1]), 0],
            [0, 1, 0, 0],
            [-Math.sin(v[1]), 0, Math.cos(v[1]), 0],
            [0, 0, 0, 1]
        ];
        const rotMatrixX = [
            [Math.cos(v[0]), -Math.sin(v[0]), 0, 0],
            [Math.sin(v[0]), Math.cos(v[0]), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
        return math.multiply(math.multiply(rotMatrixX, rotMatrixY), rotMatrixZ);
    }    
}
