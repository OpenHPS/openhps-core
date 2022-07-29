import { SerializableObject, SerializableMember } from '../../data/decorators';
import * as THREE from './_internal';
import { Matrix4 } from './Matrix4';
import { AngleUnit } from '../unit/AngleUnit';
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
    public x: number;

    @SerializableMember()
    public y: number;

    @SerializableMember()
    public z: number;

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

    /**
     * Convert the Euler angles to a vector
     *
     * @param {AngleUnit} [unit] Angle unit to use in vector
     * @returns {Vector3} Vector output of Euler angles
     */
    public toVector(unit: AngleUnit = AngleUnit.RADIAN): Vector3 {
        return new Vector3(
            AngleUnit.RADIAN.convert(this.x, unit),
            AngleUnit.RADIAN.convert(this.y, unit),
            AngleUnit.RADIAN.convert(this.z, unit),
        );
    }

    /**
     * Convert the Euler angles to a vector
     *
     * @deprecated use {@link Euler.toVector}
     * @param {AngleUnit} [unit] Angle unit to use in vector
     * @returns {Vector3} Vector output of Euler angles
     */
    public toVector3(unit?: AngleUnit): Vector3 {
        return this.toVector(unit);
    }

    /**
     * Convert quaternion to rotation matrix
     *
     * @returns {Matrix4} Rotation matrix
     */
    public toRotationMatrix(): Matrix4 {
        return Matrix4.rotationFromEuler(this);
    }

    /**
     * Get pitch in degrees
     *
     * @returns {number} Pitch in degrees
     */
    public get pitch(): number {
        return AngleUnit.RADIAN.convert(this.y, AngleUnit.DEGREE);
    }

    /**
     * Get roll in degrees
     *
     * @returns {number} Roll in degrees
     */
    public get roll(): number {
        return AngleUnit.RADIAN.convert(this.x, AngleUnit.DEGREE);
    }

    /**
     * Get yaw in degrees
     *
     * @returns {number} Yaw in degrees
     */
    public get yaw(): number {
        return AngleUnit.RADIAN.convert(this.z, AngleUnit.DEGREE);
    }

    public clone(): this {
        return new (this.constructor as new () => this)().copy(this) as this;
    }
}

export type EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX';
