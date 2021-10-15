import { Accuracy } from '../values/Accuracy';

/**
 * General abstract position class consisting of orientation, velocity, position unit and an accuracy.
 *
 * @category Position
 */
export interface Position {
    /**
     * Position recording timestamp
     */
    timestamp: number;

    /**
     * Position accuracy
     */
    accuracy: Accuracy;

    /**
     * Clone the position
     */
    clone(): this;

    /**
     * Check if this position equals another position
     *
     * @param position Other position
     */
    equals(position: this): boolean;
}
