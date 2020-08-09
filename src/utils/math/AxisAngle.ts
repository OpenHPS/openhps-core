import { AngleUnit } from "../unit";
import { SerializableObject, SerializableMember } from "../../data/decorators";
import { Matrix4 } from "./Matrix4";
import { Vector3 } from "./Vector3";
import * as THREE from './_internal';

/**
 * Axis-angle rotation
 */
@SerializableObject()
export class AxisAngle extends Vector3 {
    private _angle: number;

    constructor(x?: number, y?: number, z?: number, angle: number = null, unit: AngleUnit = AngleUnit.RADIAN) {
        super(
            unit.convert(x ? x : 0, AngleUnit.RADIAN),
            unit.convert(y ? y : 0, AngleUnit.RADIAN),
            unit.convert(z ? z : 0, AngleUnit.RADIAN)
        );

        if (angle !== null) {
            this.angle = unit.convert(angle, AngleUnit.RADIAN);
        } else {
            this.angle = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
            this.normalize();
        }
    }
    
    @SerializableMember()
    public get angle(): number {
        return this._angle;
    }

    public set angle(value: number) {
        this._angle = value;
    }

    /**
     * Convert quaternion to axis angles
     * @param quat Quaternion
     */
    public static fromQuaternion(quat: THREE.Quaternion): AxisAngle {
        const axis = new AxisAngle();
        return axis;
    }
    
    /**
     * Convert axis angle to rotation matrix
     */
    public toRotationMatrix(): Matrix4 {
        return Matrix4.rotationFromAxisAngle(this, this.angle);
    }

}
