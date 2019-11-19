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
    public getReferenceObject() : Object {
        return this._referenceObject;
    }

    /**
     * Get distance
     */
    public getDistance() : number {
        return this._distance;
    }

    public setDistance(distance: number, unit: LengthUnit) : void {
        this._distance = distance;
        this._distanceUnit = unit;
    }
}