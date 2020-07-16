import { Unit } from "../../utils";
import { Velocity } from "./Velocity";
import { Orientation } from "./Orientation";

/**
 * General position class consisting of the position, orientation and velocity.
 * Regardless on the type of position, each position should have a specific accuracy.
 */
export interface Position {
    /**
     * Position recording timestamp
     */
    timestamp: number;

    /**
     * Position accuracy
     */
    accuracy: number;

    /**
     * Accuracy unit
     */
    accuracyUnit: Unit;

    /**
     * Velocity at given position
     */
    velocity: Velocity;

    /**
     * Orientation at given position
     */
    orientation: Orientation;

}
