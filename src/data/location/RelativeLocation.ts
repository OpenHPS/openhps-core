import { Location } from "./Location";
import { LengthUnit } from "../../utils/unit/LengthUnit";

/**
 * # OpenHPS: Relative location
 */
export class RelativeLocation implements Location {
    protected referenceObject: Object;
    protected distance: number;
    protected distanceUnit: LengthUnit;

    /**
     * Get the reference object that this location is relative to
     */
    public getReferenceObject(): Object {
        return this.referenceObject;
    }

    /**
     * Get distance to reference object
     */
    public getDistance(): number {
        return this.distance;
    }

    /**
     * Get distance unit
     */
    public getDistanceUnit(): LengthUnit {
        return this.distanceUnit;
    }

    /**
     * Set distance to reference object
     * @param distance Distance to reference object
     * @param unit Length unit
     */
    public setDistance(distance: number, unit: LengthUnit): void {
        this.distance = distance;
        this.distanceUnit = unit;
    }
}
