import { LengthUnit } from "../unit/LengthUnit";

/**
 * # OpenHPS: Location
 */
export abstract class Location {
    protected _accuracy: number;
    protected _accuracyUnit: LengthUnit;

    /**
     * Get location accuracy
     */
    public getAccuracy() : number {
        return this._accuracy;
    }

    /**
     * Set location accuracy
     * @param accuracy Location accuracy
     * @param unit Length unit
     */
    public setAccuracy(accuracy: number, unit: LengthUnit) : void {
        this._accuracy = accuracy;
        this._accuracyUnit = unit;
    }

    /**
     * Get accuracy unit
     */
    public getAccuracyUnit() : LengthUnit {
        return this._accuracyUnit;
    }
}