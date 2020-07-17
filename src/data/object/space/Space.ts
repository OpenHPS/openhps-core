import { AngleUnit } from "../../../utils";

export interface Space {
    translation(dX: number, dY: number, dZ: number): Space;

    scale(kX: number, kY: number, kZ: number): Space;

    shear(): Space;

    rotation(rX: number, rY: number, rZ: number, angleUnit: AngleUnit): Space;

    /**
     * Get the transformation matrix from this reference space to the relative space
     */
    transformationMatrix: number[][];
}
