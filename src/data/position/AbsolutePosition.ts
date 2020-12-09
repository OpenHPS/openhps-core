import { Position } from './Position';
import { Vector, Quaternion, LengthUnit, Vector3 } from '../../utils';
import { Velocity } from './Velocity';
import { LinearVelocity } from './LinearVelocity';
import { AngularVelocity } from './AngularVelocity';

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
     *
     * @deprecated use linearVelocity and angularVelocity instead
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

    linearVelocity: LinearVelocity;

    angularVelocity: AngularVelocity;

    fromVector(vector: Vector, unit?: LengthUnit): void;

    toVector3(unit?: LengthUnit): Vector3;

    equals(position: AbsolutePosition): boolean;
}
