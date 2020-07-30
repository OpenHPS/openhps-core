import { AngleUnit } from "../../../utils";

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

    translation(dX: number, dY: number, dZ?: number): Space;

    scale(kX: number, kY: number, kZ?: number): Space;

    rotation(rX: number, rY: number, rZ?: number, angleUnit?: AngleUnit): Space;

    /**
     * Get the transformation matrix from this reference space to the relative space
     */
    transformationMatrix: number[][];

    /**
     * Get the rotation matrix for this reference space to the relative space
     */
    rotationMatrix: number[][];
}
