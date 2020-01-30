import 'reflect-metadata';
import { Location } from "./Location";
import { LengthUnit } from "../../utils/unit/LengthUnit";

/**
 * Absolute location
 */
export interface AbsoluteLocation extends Location {

    /**
     * Location accuracy
     */
    accuracy: number;

    /**
     * Accuracy unit
     */
    accuracyUnit: LengthUnit;

    /**
     * Cartesian point conversion
     */
    point: number[];

    /**
     * Midpoint to another location
     * @param otherLocation Other location
     */
    midpoint(otherLocation: AbsoluteLocation, distanceSelf?: number, distanceOther?: number): Promise<AbsoluteLocation>;

}
