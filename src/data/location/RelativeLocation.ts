import { Location } from "./Location";
import { LengthUnit } from "../unit/LengthUnit";

/**
 * # OpenHPS: Relative location
 */
export class RelativeLocation extends Location {
    protected _referenceObject: Object;
    protected _distance: number;
    protected _distanceUnit: LengthUnit;

    /**
     * Get the reference object that this location is relative to
     */
    public getReferenceObject(): Object {
        return this._referenceObject;
    }

    /**
     * Get distance to reference object
     */
    public getDistance(): number {
        return this._distance;
    }

    /**
     * Get distance unit
     */
    public getDistanceUnit(): LengthUnit {
        return this._distanceUnit;
    }

    /**
     * Set distance to reference object
     * @param distance Distance to reference object
     * @param unit Length unit
     */
    public setDistance(distance: number, unit: LengthUnit): void {
        this._distance = distance;
        this._distanceUnit = unit;
    }
}
