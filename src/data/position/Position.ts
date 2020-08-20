/**
 * General abstract position class consisting of orientation, velocity, position unit and an accuracy.
 */
export interface Position {

    /**
     * Position recording timestamp
     */
    timestamp: number;

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
