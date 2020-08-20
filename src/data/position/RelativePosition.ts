import { Position } from './Position';
import { LengthUnit } from '../../utils';

/**
 * Relative position to another reference object or space.
 */
export interface RelativePosition extends Position {
    /**
     * Position accuracy
     */
    accuracy: number;

    accuracyUnit: LengthUnit;

    /**
     * Get the reference object UID that this location is relative to
     */
    referenceObjectUID: string;

    referenceObjectType: string;

    equals(position: this): boolean;

    /**
     * Clone the position
     */
    clone(): this;
}
