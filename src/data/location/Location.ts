import { Unit, SpeedUnit } from "../../utils";

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

    velocity: number[];

    velocityUnit: SpeedUnit<any, any>;
}
