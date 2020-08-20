import { Quaternion, Euler, AxisAngle, EulerOrder } from "../../../utils/math";
import { AngleUnit } from "../../../utils";
import { AbsolutePosition } from "../../position";

/**
 * Space interface.
 *  Provides the ability to translate, scale and rotate a reference space
 *  in order to create a transformation matrix.
 */
export interface Space {
    /**
     * Space identifier
     */
    uid: string;

    orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Space;
    
    perspective(left: number, right: number, bottom: number, top: number, near: number, far: number): Space;

    translation(dX: number, dY: number, dZ?: number): Space;

    /**
     * Scale the reference space
     * 
     * @param kX 
     * @param kY 
     * @param kZ 
     */
    scale(kX: number, kY: number, kZ?: number): Space;

    /**
     * Rotate the space to the reference space
     *
     * @param r Rotation
     */
    rotation(r: Quaternion): Space;
    rotation(r: Euler): Space;
    rotation(r: AxisAngle): Space;
    rotation(r: { yaw: number; pitch: number; roll: number; unit?: AngleUnit }): Space;
    rotation(r: { x: number; y: number; z: number; order?: EulerOrder; unit?: AngleUnit }): Space;
    rotation(r: number[]): Space;

    baseSpaceUID: string;

    transform(position: AbsolutePosition, inverse: boolean): AbsolutePosition;
}
