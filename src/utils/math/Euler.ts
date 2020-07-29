import { AngleUnit } from "../unit";
import { SerializableObject, SerializableMember } from "../../data/decorators";
import * as math from 'mathjs';

/**
 * Euler rotation
 * @source https://github.com/mrdoob/three.js/blob/master/src/math/Euler.js
 */
@SerializableObject()
export class Euler extends Array<number> {
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

    public static fromRotationMatrix(m: number[][], order: EulerOrder = 'XYZ'): Euler {
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
        return new Euler(x, y, z, order);
    }

    public toRotationMatrix(): number[][] {
        const rotMatrixX = [
            [1, 0, 0, 0],
            [0, Math.cos(this[0]), -Math.sin(this[0]), 0],
            [0, Math.sin(this[0]), Math.cos(this[0]), 0],
            [0, 0, 0, 1]
        ];
        const rotMatrixY = [
            [Math.cos(this[1]), 0, Math.sin(this[1]), 0],
            [0, 1, 0, 0],
            [-Math.sin(this[1]), 0, Math.cos(this[1]), 0],
            [0, 0, 0, 1]
        ];
        const rotMatrixZ = [
            [Math.cos(this[2]), -Math.sin(this[2]), 0, 0],
            [Math.sin(this[2]), Math.cos(this[2]), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];

        switch (this.order) {
            case 'XZY':
                return math.multiply(math.multiply(rotMatrixX, rotMatrixZ), rotMatrixY);    
            case 'YXZ':
                return math.multiply(math.multiply(rotMatrixY, rotMatrixX), rotMatrixZ);    
            case 'YZX':
                return math.multiply(math.multiply(rotMatrixY, rotMatrixZ), rotMatrixX);    
            case 'ZXY':
                return math.multiply(math.multiply(rotMatrixZ, rotMatrixX), rotMatrixY);    
            case 'ZYX':
                return math.multiply(math.multiply(rotMatrixZ, rotMatrixY), rotMatrixX);    
            case 'XYZ':
            default:
                return math.multiply(math.multiply(rotMatrixX, rotMatrixY), rotMatrixZ);    
        }
    }

    /**
     * Clone the euler
     */
    public clone(): Euler {
        return new Euler(this.x, this.y, this.z, this.order);
    }

}

export type EulerOrder = 
    'XYZ' |
    'XZY' |
    'YXZ' |
    'YZX' |
    'ZXY' |
    'ZYX';
