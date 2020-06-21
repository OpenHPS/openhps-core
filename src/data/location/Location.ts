import { Unit } from "../../utils";
import { Velocity } from "./Velocity";

/**
 * General location class. Regardless on the type of location, each location
 * should have a specific accuracy.
 */
export interface Location {
    timestamp: number;

    /**
     * Location accuracy
     */
    accuracy: number;

    /**
     * Accuracy unit
     */
    accuracyUnit: Unit;

    /**
     * Velocity at given location
     */
    velocity: Velocity;
}
