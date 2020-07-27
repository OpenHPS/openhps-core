import { AngleUnit } from "../unit";
import { SerializableObject, SerializableMember } from "../../data/decorators";

/**
 * Euler rotation
 * @source https://github.com/mrdoob/three.js/blob/master/src/math/Euler.js
 */
@SerializableObject()
export class EulerRotation extends Array<number> {
    @SerializableMember()
    public order: EulerOrder = 'XYZ';

    constructor(x: number = 0, y: number = 0, z: number = 0, order: EulerOrder = 'XYZ', unit: AngleUnit = AngleUnit.RADIANS) {
        super();
        this.x = unit.convert(x, AngleUnit.RADIANS);
        this.y = unit.convert(y, AngleUnit.RADIANS);
        this.z = unit.convert(z, AngleUnit.RADIANS);
        this.order = order;
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

    public toVector(unit: AngleUnit = AngleUnit.RADIANS): number[] {
        return [
            AngleUnit.RADIANS.convert(this[0], unit),
            AngleUnit.RADIANS.convert(this[1], unit),
            AngleUnit.RADIANS.convert(this[2], unit)
        ];
    }

    public static fromRotationMatrix(m: number[][], order: EulerOrder = 'XYZ'): EulerRotation {
        let x = 0;
        let y = 0;
        let z = 0;

        switch (order) {
            case 'XYZ':
                y = Math.asin(Math.max(-1, Math.min(1, m[0][2])));

                if (Math.abs(m[0][2]) < 0.9999999) {
                    x = Math.atan2(-m[1][2], m[2][2]);
                    z = Math.atan2(-m[0][1], m[0][0]);
                } else {
                    x = Math.atan2(m[2][1], m[1][1]);
                    z = 0;
                }
                break;
            case 'YXZ':
                x = Math.asin(-Math.max(-1, Math.min(1, m[1][2])));

                if (Math.abs(m[1][2]) < 0.9999999) {
                    y = Math.atan2(m[0][2], m[2][2]);
                    z = Math.atan2(m[1][0], m[1][1]);
                } else {
                    y = Math.atan2(-m[2][0], m[0][0]);
                    z = 0;
                }
                break;
            case 'ZXY':
                x = Math.asin(Math.max(-1, Math.min(1, m[2][1])));

                if (Math.abs(m[2][1]) < 0.9999999) {
                    y = Math.atan2(-m[2][0], m[2][2]);
                    z = Math.atan2(-m[0][1], m[1][1]);
                } else {
                    y = 0;
                    z = Math.atan2(m[1][0], m[0][0]);
                }
                break;

            case 'ZYX':
                y = Math.asin(-Math.max(-1, Math.min(1, m[2][0])));

                if (Math.abs(m[2][0]) < 0.9999999) {
                    x = Math.atan2(m[2][1], m[2][2]);
                    z = Math.atan2(m[1][0], m[0][0]);
                } else {
                    x = 0;
                    z = Math.atan2(-m[0][1], m[1][1]);
                }
                break;

            case 'YZX':
                z = Math.asin(Math.max(-1, Math.min(1, m[1][0])));

                if (Math.abs(m[1][0]) < 0.9999999) {
                    x = Math.atan2(-m[1][2], m[1][1]);
                    y = Math.atan2(-m[2][0], m[0][0]);
                } else {
                    x = 0;
                    y = Math.atan2(m[0][2], m[2][2]);
                }
                break;
            case 'XZY':
                z = Math.asin(-Math.max(-1, Math.min(1, m[0][1])));

                if (Math.abs(m[0][1]) < 0.9999999) {
                    x = Math.atan2(m[2][1], m[1][1]);
                    y = Math.atan2(m[0][2], m[0][0]);
                } else {
                    x = Math.atan2(-m[1][2], m[2][2]);
                    y = 0;
                }
                break;
        }
        return new EulerRotation(x, y, z, order);
    }

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

        const a = Math.cos(x);
        const b = Math.sin(x);
        const c = Math.cos(y);
        const d = Math.sin(y);
        const e = Math.cos(z);
        const f = Math.sin(z);
        
        const ce = c * e;
        const cf = c * f;
        const de = d * e;
        const df = d * f;
        const ae = a * e;
        const af = a * f;
        const be = b * e;
        const bf = b * f;
        const ac = a * c;
        const ad = a * d;
        const bc = b * c;
        const bd = b * d;

        switch (this.order) {
            case 'XZY':
                matrix[0][0] = c * e;
                matrix[0][1] = -f;
                matrix[0][2] = d * e;
    
                matrix[1][0] = ac * f + bd;
                matrix[1][1] = a * e;
                matrix[1][2] = ad * f - bc;
    
                matrix[2][0] = bc * f - ad;
                matrix[2][1] = b * e;
                matrix[2][2] = bd * f + ac;
                break;
            case 'YXZ':
                matrix[0][0] = ce + df * b;
                matrix[0][1] = de * b - cf;
                matrix[0][2] = a * d;

                matrix[1][0] = a * f;
                matrix[1][1] = a * e;
                matrix[1][2] = - b;

                matrix[2][0] = cf * b - de;
                matrix[2][1] = df + ce * b;
                matrix[2][2] = a * c;
                break;
            case 'YZX':
                matrix[0][0] = c * e;
                matrix[0][1] = bd - ac * f;
                matrix[0][2] = bc * f + ad;

                matrix[1][0] = f;
                matrix[1][1] = a * e;
                matrix[1][2] = - b * e;

                matrix[2][0] = -d * e;
                matrix[2][1] = ad * f + bc;
                matrix[2][2] = ac - bd * f;
                break;
            case 'ZXY':
                matrix[0][0] = ce - df * b;
                matrix[0][1] = - a * f;
                matrix[0][2] = de + cf * b;

                matrix[1][0] = cf + de * b;
                matrix[1][1] = a * e;
                matrix[1][2] = df - ce * b;

                matrix[2][0] = -a * d;
                matrix[2][1] = b;
                matrix[2][2] = a * c;
                break;
            case 'ZYX':
                matrix[0][0] = c * e;
                matrix[0][1] = be * d - af;
                matrix[0][2] = ae * d + bf;

                matrix[1][0] = c * f;
                matrix[1][1] = bf * d + ae;
                matrix[1][2] = af * d - be;

                matrix[2][0] = -d;
                matrix[2][1] = b * c;
                matrix[2][2] = a * c;
                break;
            case 'XYZ':
            default:
                matrix[0][0] = c * e;
                matrix[0][1] = -c * f;
                matrix[0][2] = d;

                matrix[1][0] = af + be * d;
                matrix[1][1] = ae - bf * d;
                matrix[1][2] = -b * c;

                matrix[2][0] = bf - ae * d;
                matrix[2][1] = be + af * d;
                matrix[2][2] = a * c;
                break;
        }
        return matrix;
    }

    /**
     * Clone the euler
     */
    public clone(): EulerRotation {
        return new EulerRotation(this.x, this.y, this.z, this.order);
    }

}

export type EulerOrder = 
    'XYZ' |
    'XZY' |
    'YXZ' |
    'YZX' |
    'ZXY' |
    'ZYX';
