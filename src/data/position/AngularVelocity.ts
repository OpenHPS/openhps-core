import { AngularVelocityUnit } from "../../utils/unit/AngularVelocityUnit";
import { SerializableObject, SerializableMember } from "../decorators";
import * as math from 'mathjs';

@SerializableObject()
export class AngularVelocity extends Array<number> {

    constructor(x: number = 0, y: number = 0, z: number = 0, unit: AngularVelocityUnit<any, any> = AngularVelocityUnit.RADIANS_PER_SECOND) {
        super();
        this.x = unit.convert(x, AngularVelocityUnit.RADIANS_PER_SECOND);
        this.y = unit.convert(y, AngularVelocityUnit.RADIANS_PER_SECOND);
        this.z = unit.convert(z, AngularVelocityUnit.RADIANS_PER_SECOND);
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
        const v = this.toVector();
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
