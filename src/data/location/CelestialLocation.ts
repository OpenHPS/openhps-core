import { AbsoluteLocation } from "./AbsoluteLocation";
import { SerializableObject, SerializableMember } from "../decorators";
import { LengthUnit } from "../../utils";

@SerializableObject()
export abstract class CelestialLocation implements AbsoluteLocation {
    private _accuracy: number;
    private _timestamp: number = new Date().getTime();

    @SerializableMember()
    public get timestamp(): number {
        return this._timestamp;
    }

    public set timestamp(timestamp: number) {
        this._timestamp = timestamp;
    }
    
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
    public get accuracyUnit(): LengthUnit {
        return LengthUnit.POINTS;
    }
    
    /**
     * Cartesian point conversion
     */
    abstract point: number[];

    /**
     * Midpoint to another location
     * @param otherLocation Other location
     */
    abstract midpoint(otherLocation: AbsoluteLocation, distanceSelf?: number, distanceOther?: number): Promise<AbsoluteLocation>;
}
