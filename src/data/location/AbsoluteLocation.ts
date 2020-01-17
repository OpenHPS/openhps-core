import 'reflect-metadata';
import { Location } from "./Location";
import { LengthUnit } from "../../utils/unit/LengthUnit";
import { jsonObject, jsonMember } from "typedjson";

/**
 * Absolute location
 */
@jsonObject
export class AbsoluteLocation implements Location {
    @jsonMember
    protected accuracy: number;
    @jsonMember
    protected accuracyUnit: LengthUnit;

    /**
     * Get location accuracy
     */
    public getAccuracy(): number {
        return this.accuracy;
    }

    /**
     * Set location accuracy
     * @param accuracy Location accuracy
     * @param unit Length unit
     */
    public setAccuracy(accuracy: number, unit: LengthUnit): void {
        this.accuracy = accuracy;
        this.accuracyUnit = unit;
    }

    /**
     * Get accuracy unit
     */
    public getAccuracyUnit(): LengthUnit {
        return this.accuracyUnit;
    }
}
