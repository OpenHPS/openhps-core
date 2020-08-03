import { AngleUnit } from "../unit";
import { SerializableObject, SerializableMember } from "../../data/decorators";
import * as math from 'mathjs';
import { Vector4 } from "./Vector4";

/**
 * Axis-angle rotation
 */
@SerializableObject()
export class AxisAngle extends Vector4 {

    constructor(x?: number, y?: number, z?: number, angle: number = null, unit: AngleUnit = AngleUnit.RADIANS) {
        super(
            unit.convert(x ? x : 0, AngleUnit.RADIANS),
            unit.convert(y ? y : 0, AngleUnit.RADIANS),
            unit.convert(z ? z : 0, AngleUnit.RADIANS)
        );

        if (angle !== null) {
            this.angle = unit.convert(angle, AngleUnit.RADIANS);
        } else {
            this.angle = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
            const normalized = math.divide(this, this.angle) as number[];
            this.x = normalized[0];
            this.y = normalized[1];
            this.z = normalized[2];
        }
    }
    
    @SerializableMember()
    public get angle(): number {
        return this[3];
    }

    public set angle(value: number) {
        this[3] = value;
    }

    public static fromVector(vector: number[]): AxisAngle {
        return new AxisAngle(vector[0], vector[1], vector[2]);
    }

    public toVector(unit: AngleUnit = AngleUnit.RADIANS): number[] {
        return [
            AngleUnit.RADIANS.convert(this[0], unit),
            AngleUnit.RADIANS.convert(this[1], unit),
            AngleUnit.RADIANS.convert(this[2], unit)
        ];
    }

    /**
     * Clone the axis
     */
    public clone(): AxisAngle {
        return new AxisAngle(this.x, this.y, this.z, this.angle);
    }

}
