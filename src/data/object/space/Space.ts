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

    translate(dX: number, dY: number, dZ?: number): Space;

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
     * @param r Rotation
     */
    rotate(r: { x: number, y: number, z?: number, order?: EulerOrder, unit?: AngleUnit }): Space;
    rotate(r: number[]): Space;
    rotate(r: Quaternion): Space;
    rotate(r: Euler): Space;
    rotate(r: AxisAngle): Space;
    rotate(r: any): Space;

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
