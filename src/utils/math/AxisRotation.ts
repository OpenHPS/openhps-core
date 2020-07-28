import { AngleUnit } from "../unit";
import { SerializableObject, SerializableMember } from "../../data/decorators";
import * as math from 'mathjs';

/**
 * Axis rotation
 */
@SerializableObject()
export class AxisRotation extends Array<number> {

    constructor(x: number = 0, y: number = 0, z: number = 0, angle: number = -1, unit: AngleUnit = AngleUnit.RADIANS) {
        super();
        this.x = unit.convert(x, AngleUnit.RADIANS);
        this.y = unit.convert(y, AngleUnit.RADIANS);
        this.z = unit.convert(z, AngleUnit.RADIANS);

        if (angle === -1) {
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
    public get x(): number {
        return this[0];
    }

    public set x(value: number) {
        this[0] = value;
    }

    @SerializableMember()
    public get y(): number {
        return this[1];
    }

    public set y(value: number) {
        this[1] = value;
    }

    @SerializableMember()
    public get z(): number {
        return this[2];
    }

    public set z(value: number) {
        this[2] = value;
    }
    
    @SerializableMember()
    public get angle(): number {
        return this[3];
    }

    public set angle(value: number) {
        this[3] = value;
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
    public clone(): AxisRotation {
        return new AxisRotation(this.x, this.y, this.z);
    }

}
