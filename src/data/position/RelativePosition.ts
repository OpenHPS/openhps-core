import { Position } from './Position';

/**
 * Relative position to another reference object or space.
 *
 * @category Position
 */
export interface RelativePosition<T = number> extends Position {
    /**
     * Position accuracy
     */
    accuracy: number;

    /**
     * Get the reference object UID that this location is relative to
     */
    referenceObjectUID: string;

    referenceObjectType: string;

    referenceValue: T;

    equals(position: this): boolean;

    /**
     * Clone the position
     */
    clone(): this;
}
