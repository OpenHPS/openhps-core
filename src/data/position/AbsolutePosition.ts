import { Position } from "./Position";
import { LengthUnit } from "../../utils/unit/LengthUnit";
import { Orientation } from "./Orientation";
import { Velocity } from "./Velocity";
import { SerializableObject, SerializableMember } from "../decorators";

/**
 * Absolute position
 */
@SerializableObject()
export abstract class AbsolutePosition implements Position {
    private _accuracy: number;
    private _unit: LengthUnit = LengthUnit.POINTS;
    private _timestamp: number = new Date().getTime();
    private _velocity: Velocity;
    private _orientation: Orientation;

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

    @SerializableMember()
    public get orientation(): Orientation {
        return this._orientation;
    }

    public set orientation(orientation: Orientation) {
        this._orientation = orientation;
    }

    /**
     * Get position accuracy
     */
    @SerializableMember()
    public get accuracy(): number {
        return this._accuracy;
    }

    /**
     * Set position accuracy
     * @param accuracy Position accuracy
     */
    public set accuracy(accuracy: number) {
        this._accuracy = accuracy;
    }

    @SerializableMember()
    public get unit(): LengthUnit {
        return this._unit;
    }

    public set unit(unit: LengthUnit) {
        this._unit = unit;
    }

    public get accuracyUnit(): LengthUnit {
        return this.unit;
    }

    public abstract point: number[];
}
