import { SerializableObject, SerializableMember } from "../decorators";
import { AngleUnit } from "../../utils";

/**
 * Orientation
 */
@SerializableObject()
export class Orientation {
    @SerializableMember()
    public x: number;

    @SerializableMember()
    public y: number;

    @SerializableMember()
    public z: number;

    @SerializableMember()
    public unit: AngleUnit;

    constructor(x: number = 0, y: number = 0, z: number = 0, unit: AngleUnit = AngleUnit.RADIANS) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.unit = unit;
    }

    public static fromVector(vector: number[], unit: AngleUnit = AngleUnit.RADIANS): Orientation {
        return new Orientation(vector[0], vector[1], vector[2], unit);
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
}
