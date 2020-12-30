import { Position } from './Position';
import { Vector, LengthUnit, Vector3 } from '../../utils';
import { Velocity } from './Velocity';
import { LinearVelocity } from './LinearVelocity';
import { AngularVelocity } from './AngularVelocity';
import { Orientation } from './Orientation';

/**
 * Absolute position
 *
 * @category Position
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
    orientation: Orientation;

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
