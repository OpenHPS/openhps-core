import { AbsoluteLocation } from "./AbsoluteLocation";
import { SerializableObject, SerializableMember, SerializableArrayMember } from "../decorators";
import { LengthUnit } from "../../utils";
import { Velocity } from "./Velocity";

@SerializableObject()
export abstract class CelestialLocation implements AbsoluteLocation {
    private _accuracy: number;
    private _timestamp: number = new Date().getTime();
    private _velocity: Velocity = new Velocity();

    @SerializableMember()
    public get timestamp(): number {
        return this._timestamp;
    }

    public set timestamp(timestamp: number) {
        this._timestamp = timestamp;
    }

    @SerializableMember()
    public get velocity(): Velocity {
        return this._velocity;
    }

    public set velocity(velocity: Velocity) {
        this._velocity = velocity;
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

}
