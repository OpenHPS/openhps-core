import { Position } from './Position';
import { Vector, LengthUnit, Vector3 } from '../../utils';
import { Velocity } from './Velocity';
import { LinearVelocity } from './LinearVelocity';
import { AngularVelocity } from './AngularVelocity';
import { Orientation } from './Orientation';
import { TypedJSON } from 'typedjson';
import { DataSerializer } from '../DataSerializer';

/**
 * An absolute position of a [[DataObject]].
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

    /**
     * Linear velocity
     */
    linearVelocity: LinearVelocity;

    /**
     * Angular elocity
     */
    angularVelocity: AngularVelocity;

    /**
     * Get the angle in radians from this position to a destination
     *
     * @param {AbsolutePosition} destination Destination position
     * @returns {number} Bearing in radians from this position to destination
     */
    angleTo(position: AbsolutePosition): number;

    /**
     * Get the distance from this location to a destination
     *
     * @param {AbsolutePosition} destination Destination location
     * @returns {number} Distance between this point and destination
     */
    distanceTo(position: AbsolutePosition): number;

    fromVector(vector: Vector, unit?: LengthUnit): this;

    toVector3(unit?: LengthUnit): Vector3;

    equals(position: AbsolutePosition): boolean;
}

/**
 * Deserailize an absolute position
 *  Do not use this function in external modules!
 *
 * @param {any} raw Json object
 * @returns {AbsolutePosition} Deserialized position
 */
export function AbsolutePositionDeserializer(raw: any): AbsolutePosition {
    if (raw === undefined) {
        return undefined;
    }
    return new TypedJSON(DataSerializer.findTypeByName(raw.__type)).parse(raw);
}
