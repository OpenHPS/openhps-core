import { SerializableObject, SerializableMember } from '../../data/decorators';
import * as THREE from './_internal';
import { Matrix4 } from './Matrix4';
import { AngleUnit } from '../unit';
import { Vector3 } from './Vector3';

/**
 * Serializable THREE.js Euler
 */
@SerializableObject()
export class Euler extends THREE.Euler {
    constructor(x?: number, y?: number, z?: number, order?: EulerOrder, unit?: AngleUnit) {
        super(x, y, z, order);
        if (unit) {
            this.x = unit.convert(this.x, AngleUnit.RADIAN);
            this.y = unit.convert(this.y, AngleUnit.RADIAN);
            this.z = unit.convert(this.z, AngleUnit.RADIAN);
        }
    }

    @SerializableMember()
    public get x(): number {
        return super.x;
    }

    public set x(value: number) {
        super.x = value;
    }

    @SerializableMember()
    public get y(): number {
        return super.y;
    }

    public set y(value: number) {
        super.y = value;
    }

    @SerializableMember()
    public get z(): number {
        return super.z;
    }

    public set z(value: number) {
        super.z = value;
    }

    /**
     * Convert quaternion to euler
     *
     * @param {THREE.Quaternion} quat Quaternion
     * @param {string} [order='XYZ'] Euler order
     * @returns {Euler} Euler instance
     */
    public static fromQuaternion(quat: THREE.Quaternion, order: EulerOrder = 'XYZ'): Euler {
        const euler = new Euler();
        euler.setFromQuaternion(quat, order);
        return euler;
    }

    /**
     * Convert rotation matrix to euler
     *
     * @param {Matrix4} matrix Rotation matrix
     * @param {string} [order='XYZ'] Euler order
     * @returns {Euler} Euler instance
     */
    public static fromRotationMatrix(matrix: Matrix4, order: EulerOrder = 'XYZ'): Euler {
        const euler = new Euler();
        euler.setFromRotationMatrix(matrix, order);
        return euler;
    }

    public toVector(unit: AngleUnit = AngleUnit.RADIAN): Vector3 {
        return new Vector3(
            AngleUnit.RADIAN.convert(this.x, unit),
            AngleUnit.RADIAN.convert(this.y, unit),
            AngleUnit.RADIAN.convert(this.z, unit),
        );
    }

    /**
     * Convert quaternion to rotation matrix
     *
     * @returns {Matrix4} Rotation matrix
     */
    public toRotationMatrix(): Matrix4 {
        return Matrix4.rotationFromEuler(this);
    }
}

export type EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX';
