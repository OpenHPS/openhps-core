import { SerializableMember, SerializableObject } from "../../data/decorators";
import { AxisAngle } from "./AxisAngle";
import { Euler, EulerOrder } from "./Euler";
import { AngleUnit } from "../unit";
import * as math from 'mathjs';

/**
 * Quaternion
 * 
 * @source https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js
 */
@SerializableObject()
export class Quaternion extends Array<number> {

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
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

    @SerializableMember()
    public get w(): number {
        return this[3];
    }

    public set w(value: number) {
        this[3] = value;
    }

    public static fromVector(vector: number[]): Quaternion {
        return new Quaternion(vector[0], vector[1], vector[2], vector[3]);
    }

    /**
     * Create an orientation based on euler angles
     * @param rotation Euler angles
     */
    public static fromEuler(euler: { x: number, y: number, z: number, order?: EulerOrder, unit?: AngleUnit }): Quaternion;
    public static fromEuler(euler: number[]): Quaternion;
    public static fromEuler(euler: Euler): Quaternion;
    public static fromEuler(euler: any): Quaternion {
        let rotation: Euler;

        if (euler instanceof Euler) {
            rotation = euler;
        } else if (euler instanceof Array) {
            rotation = new Euler(euler[0], euler[1], euler[2]);
        } else {
            rotation = new Euler(euler.x, euler.y, euler.z, euler.order, euler.unit);
        }

        const cy = math.cos(math.divide(rotation.z, 2));
        const sy = math.sin(math.divide(rotation.z, 2));
        const cp = math.cos(math.divide(rotation.y, 2));
        const sp = math.sin(math.divide(rotation.y, 2));
        const cr = math.cos(math.divide(rotation.x, 2));
        const sr = math.sin(math.divide(rotation.x, 2));
    
        let w = 0;
        let x = 0;
        let y = 0;
        let z = 0;

        switch (rotation.order) {
            case 'XYZ':
                x = sr * cp * cy + cr * sp * sy;
                y = cr * sp * cy - sr * cp * sy;
                z = cr * cp * sy + sr * sp * cy;
                w = cr * cp * cy - sr * sp * sy;
                break;
            case 'YXZ':
                x = sr * cp * cy + cr * sp * sy;
                y = cr * sp * cy - sr * cp * sy;
                z = cr * cp * sy - sr * sp * cy;
                w = cr * cp * cy + sr * sp * sy;
                break;
            case 'ZXY':
                x = sr * cp * cy - cr * sp * sy;
                y = cr * sp * cy + sr * cp * sy;
                z = cr * cp * sy + sr * sp * cy;
                w = cr * cp * cy - sr * sp * sy;
                break;
            case 'ZYX':
                x = sr * cp * cy - cr * sp * sy;
                y = cr * sp * cy + sr * cp * sy;
                z = cr * cp * sy - sr * sp * cy;
                w = cr * cp * cy + sr * sp * sy;
                break;
            case 'YZX':
                x = sr * cp * cy + cr * sp * sy;
                y = cr * sp * cy + sr * cp * sy;
                z = cr * cp * sy - sr * sp * cy;
                w = cr * cp * cy - sr * sp * sy;
                break;
            case 'XZY':
                x = sr * cp * cy - cr * sp * sy;
                y = cr * sp * cy - sr * cp * sy;
                z = cr * cp * sy + sr * sp * cy;
                w = cr * cp * cy + sr * sp * sy;
                break;
        }
        return new Quaternion(x, y, z, w);
    }

    /**
     * Convert axis angle rotation to quaternion
     * 
     * @param axis Axis-angle rotation
     */
    public static fromAxisAngle(axis: { x: number, y: number, z: number, angle?: number, unit?: AngleUnit }): Quaternion;
    public static fromAxisAngle(axis: number[]): Quaternion;
    public static fromAxisAngle(axis: AxisAngle): Quaternion;
    public static fromAxisAngle(axis: any): Quaternion {
        let rotation: AxisAngle;
        
        if (axis instanceof AxisAngle) {
            rotation = axis;
        } else if (axis instanceof Array) {
            rotation = new AxisAngle(axis[0], axis[1], axis[2], axis.length === 4 ? axis[3] : null);
        } else {
            rotation = new AxisAngle(axis.x, axis.y, axis.z, axis.angle ? axis.angle : null, axis.unit);
        }

        const halfAngle = rotation.angle / 2;
        const s = Math.sin(halfAngle);
        const x = rotation.x * s;
        const y = rotation.y * s;
        const z = rotation.z * s;
        const w = Math.cos(halfAngle);
        return new Quaternion(x, y, z, w);
    }

    /**
     * Convert rotation matrix to quaternion
     * 
     * @param m Rotation matrix
     */
    public static fromRotationMatrix(m: number[][]): Quaternion {
        let x = 0;
        let y = 0;
        let z = 0;
        let w = 1;

        const trace = m[0][0] + m[1][1] + m[2][2];
        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);

            w = 0.25 / s;
            x = (m[2][1] - m[1][2]) * s;
            y = (m[0][2] - m[2][0]) * s;
            z = (m[1][0] - m[0][1]) * s;
        } else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) {
            const s = 2.0 * Math.sqrt(1.0 + m[0][0] - m[1][1] - m[2][2]);
            
            w = (m[2][1] - m[1][2]) / s;
            x = 0.25 * s;
            y = (m[0][1] + m[1][0]) / s;
            z = (m[0][2] + m[2][0]) / s;
        } else if (m[1][1] > m[2][2]) {
            const s = 2.0 * Math.sqrt(1.0 + m[1][1] - m[0][0] - m[2][2]);

            w = (m[0][2] - m[2][0]) / s;
            x = (m[0][1] + m[1][0]) / s;
            y = 0.25 * s;
            z = (m[1][2] + m[2][1]) / s;
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m[2][2] - m[0][0] - m[1][1]);

            w = (m[1][0] - m[0][1]) / s;
            x = (m[0][2] + m[2][0]) / s;
            y = (m[1][2] + m[2][1]) / s;
            z = 0.25 * s;
        }
        return new Quaternion(x, y, z, w);
    }

    public toVector(): number[] {
        return this;
    }

    /**
     * Convert quaternion to rotation matrix
     */
    public toRotationMatrix(): number[][] {
        const matrix: number[][] = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];

        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;

        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        matrix[0][0] = (1 - (yy + zz)) * 1;
        matrix[1][0] = (xy + wz) * 1;
        matrix[2][0] = (xz - wy) * 1;

        matrix[0][1] = (xy - wz) * 1;
        matrix[1][1] = (1 - (xx + zz)) * 1;
        matrix[2][1] = (yz + wx) * 1;
        
        matrix[0][2] = (xz + wy) * 1;
        matrix[1][2] = (yz - wx) * 1;
        matrix[2][2] = (1 - (xx + yy)) * 1;
        return matrix;
    }

    /**
     * Convert quaternion to euler angles
     */
    public toEuler(): Euler {
        const x = Math.atan2(2 * (this.w * this.x + this.y * this.z), 1 - 2 * (Math.pow(this.x, 2) + Math.pow(this.y, 2)));
        const y = Math.asin(2 * (this.w * this.y - this.z * this.x));
        const z = Math.atan2(2 * (this.w * this.z + this.x * this.y), 1 - 2 * (Math.pow(this.y, 2) + Math.pow(this.z, 2)));
        return new Euler(x, y, z, 'ZYX');
    }

    /**
     * Convert quaternion to axis angle
     */
    public toAxisAngle(): AxisAngle {
        const angle = 2 * Math.acos(this.w);
        const x = this.x / Math.sqrt(1 - Math.pow(this.w, 2));
        const y = this.y / Math.sqrt(1 - Math.pow(this.w, 2));
        const z = this.z / Math.sqrt(1 - Math.pow(this.w, 2));
        return new AxisAngle(x, y, z, angle);
    }

    /**
     * Clone the quaternion
     */
    public clone(): Quaternion {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

}
