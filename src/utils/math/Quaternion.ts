/**
 * Quaternion
 * 
 * @source https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js
 */
export class Quaternion extends Array<number> {

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        super();
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this[3] = w;
    }

    public get x(): number {
        return this[0];
    }

    public set x(value: number) {
        this[0] = value;
    }

    public get y(): number {
        return this[1];
    }

    public set y(value: number) {
        this[1] = value;
    }

    public get z(): number {
        return this[2];
    }

    public set z(value: number) {
        this[2] = value;
    }

    public get w(): number {
        return this[3];
    }

    public set w(value: number) {
        this[3] = value;
    }

    public toVector(): number[] {
        return this;
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

    /**
     * Clone the quaternion
     */
    public clone(): Quaternion {
        return new Quaternion(this[0], this[1], this[2], this[3]);
    }

}
