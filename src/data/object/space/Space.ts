import { Quaternion, Euler, AxisAngle, EulerOrder, Matrix4 } from '../../../utils/math';
import { AngleUnit } from '../../../utils';
import { AbsolutePosition } from '../../position';

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
     * @param {number} kX Scale of X-axis
     * @param {number} kY Scale of Y-axis
     * @param {number} kZ Scale of Z-axis
     * @returns {Space} Reference space instance
     */
    scale(kX: number, kY: number, kZ?: number): Space;

    /**
     * Rotate the space to the reference space
     *
     * @param {any} r Rotation
     */
    rotation(r: Quaternion): Space;
    rotation(r: Euler): Space;
    rotation(r: AxisAngle): Space;
    rotation(r: { yaw: number; pitch: number; roll: number; unit?: AngleUnit }): Space;
    rotation(r: { x: number; y: number; z: number; order?: EulerOrder; unit?: AngleUnit }): Space;
    rotation(r: number[]): Space;

    baseSpaceUID: string;

    /**
     * Transform a position
     *
     * @param {AbsolutePosition} position Position to transform
     * @param {SpaceTransformationOptions} [options] Transformation options
     * @returns {AbsolutePosition} Transformed position
     */
    transform(position: AbsolutePosition, options?: SpaceTransformationOptions): AbsolutePosition;

    transformationMatrix: Matrix4;
}

export interface SpaceTransformationOptions {
    inverse?: boolean;
}
