import { Position } from "./Position";
import { Vector, Quaternion, LengthUnit, Vector3, Vector4 } from "../../utils";
import { Velocity } from "./Velocity";

/**
 * Absolute position
 */
export interface AbsolutePosition extends Position {
    
    /**
     * Position reference space UID
     */
    referenceSpaceUID: string;

    /**
     * Velocity at recorded position
     */
    velocity: Velocity;

    /**
     * Orientation at recorded position
     */
    orientation: Quaternion;

    /**
     * Position unit
     */
    unit: LengthUnit;

    /**
     * Position accuracy
     */
    accuracy: number;
    
    /**
     * Position accuracy unit
     */
    accuracyUnit: LengthUnit;

    fromVector(vector: Vector, unit?: LengthUnit): void;

    toVector3(): Vector3;

    equals(position: AbsolutePosition): boolean;

}
