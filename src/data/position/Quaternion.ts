import { SerializableObject, SerializableMember } from "../decorators";
import * as math from 'mathjs';
import { AngleUnit } from "../../utils";

/**
 * Quaternion orientation
 * 
 * @source https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js
 */
@SerializableObject()
export class Quaternion {
    @SerializableMember()
    public x: number;

    @SerializableMember()
    public y: number;

    @SerializableMember()
    public z: number;

    @SerializableMember()
    public w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * Clone the quaternion
     */
    public clone(): Quaternion {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    /**
     * Get the orientation quaternion from an euler vector
     * @param vector Euler vector
     * @param unit Euler angle unit
     */
    public static fromEulerVector(vector: number[], unit: AngleUnit = AngleUnit.RADIANS): Quaternion {
        // Convert vector to radians
        vector[0] = unit.convert(vector[0], AngleUnit.RADIANS);
        vector[1] = unit.convert(vector[1], AngleUnit.RADIANS);
        vector[2] = unit.convert(vector[2], AngleUnit.RADIANS);

        const c1 = Math.cos(vector[0] / 2);
        const c2 = Math.cos(vector[1] / 2);
        const c3 = Math.cos(vector[2] / 2);

        const s1 = Math.sin(vector[0] / 2);
        const s2 = Math.sin(vector[1] / 2);
        const s3 = Math.sin(vector[2] / 2);

        // http://www.mathworks.com/matlabcentral/fileexchange/
        //  20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
        //  content/SpinCalc.m
        
        const quaternion = new Quaternion();
        quaternion.x = s1 * c2 * c3 + c1 * s2 * s3;
        quaternion.y = c1 * s2 * c3 - s1 * c2 * s3;
        quaternion.z = c1 * c2 * s3 + s1 * s2 * c3;
        quaternion.w = c1 * c2 * c3 - s1 * s2 * s3;
        return quaternion;
    }

    /**
     * Convert the quaternion to an euler vector
     * @param unit Unit of euler angles
     */
    public toEulerVector(unit: AngleUnit = AngleUnit.RADIANS): number[] {
        const roll = Math.atan2(2.0 * this.y * this.w - 2.0 * this.x * this.z, 1 - 2.0 * this. y * this.y - 2.0 * this. z * this.z);
        const pitch = Math.atan2(2.0 * this.x * this.w - 2.0 * this.y * this.z, 1 - 2.0 * this.x * this.x - 2.0 * this.z * this.z);
        const yaw = Math.asin(2.0 * this.x * this.y + 2.0 * this.z * this.w);
        return [
            AngleUnit.RADIANS.convert(pitch, unit),
            AngleUnit.RADIANS.convert(roll, unit),
            AngleUnit.RADIANS.convert(yaw, unit)
        ];
    }

    /**
     * Convert the quaternion to a rotation matrix
     */
    public toRotationMatrix(): number[][] {
        const v = this.toEulerVector(AngleUnit.RADIANS);
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
