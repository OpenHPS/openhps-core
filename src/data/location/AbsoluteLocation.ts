import { Location } from "./Location";
import { LengthUnit } from "../../utils/unit/LengthUnit";
import { jsonObject, jsonMember } from "typedjson";

/**
 * Absolute location
 */
@jsonObject
export class AbsoluteLocation implements Location {
    private _accuracy: number;
    private _accuracyUnit: LengthUnit;

    /**
     * Get location accuracy
     */
    public get accuracy(): number {
        return this._accuracy;
    }

    /**
     * Set location accuracy
     * @param accuracy Location accuracy
     */
    public set accuracy(accuracy: number) {
        this._accuracy = accuracy;
    }

    public set accuracyUnit(accuracyUnit: LengthUnit) {
        this._accuracyUnit = accuracyUnit;
    }

    /**
     * Get accuracy unit
     */
    public get accuracyUnit(): LengthUnit {
        return this._accuracyUnit;
    }
}
