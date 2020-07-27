import { SerializableObject, SerializableMember } from "../decorators";
import { LinearVelocityUnit } from "../../utils";

@SerializableObject()
export class LinearVelocity extends Array<number> {
    constructor(x: number = 0, y: number = 0, z: number = 0, unit: LinearVelocityUnit<any, any> = LinearVelocityUnit.METERS_PER_SECOND) {
        super();
        this.x = unit.convert(x, LinearVelocityUnit.METERS_PER_SECOND);
        this.y = unit.convert(y, LinearVelocityUnit.METERS_PER_SECOND);
        this.z = unit.convert(z, LinearVelocityUnit.METERS_PER_SECOND);
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

    public get z(): number {
        return this[2];
    }

    @SerializableMember()
    public set z(value: number) {
        this[2] = value;
    }

    public static fromVector(vector: number[], unit: LinearVelocityUnit<any, any> = LinearVelocityUnit.METERS_PER_SECOND): LinearVelocity {
        return new LinearVelocity(vector[0], vector[1], vector[2], unit);
    }

    public toVector(unit?: LinearVelocityUnit<any, any>): number [] {
        if (unit === undefined || unit === LinearVelocityUnit.METERS_PER_SECOND) {
            return [this.x, this.y, this.z];
        } else {
            return [LinearVelocityUnit.METERS_PER_SECOND.convert(this.x, unit), 
                LinearVelocityUnit.METERS_PER_SECOND.convert(this.y, unit), 
                LinearVelocityUnit.METERS_PER_SECOND.convert(this.z, unit)];
        }
    }

    public toTranslationMatrix(): number[][] {
        const v = this.toVector();
        return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [v[0], v[1], v[2], 1]
        ];
    }
}
