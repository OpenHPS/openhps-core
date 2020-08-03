import { AngleUnit, EulerOrder, Quaternion, AxisAngle, Euler } from "../../../utils";

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

    /**
     * Rotate the space to the reference space
     * @param r Rotation
     */
    rotation(r: { x: number, y: number, z?: number, order?: EulerOrder, unit?: AngleUnit }): Space;
    rotation(r: number[]): Space;
    rotation(r: Quaternion): Space;
    rotation(r: Euler): Space;
    rotation(r: AxisAngle): Space;
    rotation(r: any): Space;

    /**
     * Transform the vector to another
     * 
     * @param vector Vector to transform
     */
    transform(vector: number[]): number[];

    /**
     * Get the transformation matrix from this reference space to the relative space
     */
    transformationMatrix: number[][];

    /**
     * Get the rotation matrix for this reference space to the relative space
     */
    rotationMatrix: number[][];

    baseSpaceUID: string;
}
