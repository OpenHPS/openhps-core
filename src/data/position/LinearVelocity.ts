import { SerializableObject, SerializableMember } from "../decorators";
import { LinearVelocityUnit } from "../../utils";

@SerializableObject()
export class LinearVelocity {
    @SerializableMember()
    public x: number;
    @SerializableMember()
    public y: number;
    @SerializableMember()
    public z: number;
    
    @SerializableMember()
    public unit: LinearVelocityUnit<any, any>;
    
    constructor(x: number = 0, y: number = 0, z: number = 0, unit: LinearVelocityUnit<any, any> = LinearVelocityUnit.METERS_PER_SECOND) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.unit = unit;
    }

    public static fromVector(vector: number[], unit: LinearVelocityUnit<any, any> = LinearVelocityUnit.METERS_PER_SECOND): LinearVelocity {
        return new LinearVelocity(vector[0], vector[1], vector[2], unit);
    }

    public toVector(unit?: LinearVelocityUnit<any, any>): number [] {
        if (unit === undefined) {
            return [this.x, this.y, this.z];
        } else {
            return [this.unit.convert(this.x, unit), 
                this.unit.convert(this.y, unit), 
                this.unit.convert(this.z, unit)];
        }
    }

    public toTranslationMatrix(): number[][] {
        const v = this.toVector(LinearVelocityUnit.METERS_PER_SECOND);
        return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [v[0], v[1], v[2], 1]
        ];
    }
}
