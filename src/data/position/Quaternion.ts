import { SerializableObject, SerializableMember } from "../decorators";
import { AngleUnit } from "../../utils";
import * as math from 'mathjs';

/**
 * Orientation
 */
@SerializableObject()
export class Quaternion {
    @SerializableMember()
    public x: number;

    @SerializableMember()
    public y: number;

    @SerializableMember()
    public z: number;

    public w: number = 1;

    @SerializableMember()
    public unit: AngleUnit;

    constructor(x: number = 0, y: number = 0, z: number = 0, unit: AngleUnit = AngleUnit.RADIANS) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.unit = unit;
    }

    public static fromVector(vector: number[], unit: AngleUnit = AngleUnit.RADIANS): Quaternion {
        return new Quaternion(vector[0], vector[1], vector[2], unit);
    }

    public toVector(unit?: AngleUnit): number [] {
        if (unit === undefined) {
            return [this.x, this.y, this.z];
        } else {
            return [this.unit.convert(this.x, unit), 
                this.unit.convert(this.y, unit), 
                this.unit.convert(this.z, unit)];
        }
    }

    public toRotationMatrix(): number[][] {
        const v = this.toVector(AngleUnit.RADIANS);
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
