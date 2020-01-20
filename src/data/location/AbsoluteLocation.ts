import 'reflect-metadata';
import { Location } from "./Location";
import { LengthUnit } from "../../utils/unit/LengthUnit";
import { SerializableObject, SerializableMember } from "../decorators";

/**
 * Absolute location
 */
@SerializableObject()
export class AbsoluteLocation implements Location {
    private _accuracy: number;
    private _accuracyUnit: LengthUnit;

    /**
     * Get location accuracy
     */
    @SerializableMember()
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

    /**
     * Get accuracy unit
     */
    @SerializableMember()
    public get accuracyUnit(): LengthUnit {
        return this._accuracyUnit;
    }

    public set accuracyUnit(accuracyUnit: LengthUnit) {
        this._accuracyUnit = accuracyUnit;
    }
}
