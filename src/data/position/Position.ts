import { LengthUnit } from "../../utils";
import { Velocity } from "./Velocity";
import { Orientation } from "./Orientation";
import { SerializableObject, SerializableMember } from "../decorators";
import { DataSerializer } from "../DataSerializer";

/**
 * General position class consisting of the position, orientation and velocity.
 * Regardless on the type of position, each position should have a specific accuracy.
 */
@SerializableObject()
export abstract class Position {
    private _accuracy: number;
    private _timestamp: number = new Date().getTime();
    private _velocity: Velocity = new Velocity();
    private _orientation: Orientation = new Orientation();
    private _unit: LengthUnit = LengthUnit.POINTS;
    private _accuracyUnit: LengthUnit = LengthUnit.POINTS;

    /**
     * Position recording timestamp
     */
    @SerializableMember()
    public get timestamp(): number {
        return this._timestamp;
    }

    public set timestamp(timestamp: number) {
        this._timestamp = timestamp;
    }

    /**
     * Velocity at recorded position
     */
    @SerializableMember()
    public get velocity(): Velocity {
        return this._velocity;
    }

    public set velocity(velocity: Velocity) {
        this._velocity = velocity;
    }

    /**
     * Orientation at recorded position
     */
    @SerializableMember()
    public get orientation(): Orientation {
        return this._orientation;
    }

    public set orientation(orientation: Orientation) {
        this._orientation = orientation;
    }

    /**
     * Position accuracy
     */
    @SerializableMember()
    public get accuracy(): number {
        return this._accuracy;
    }

    public set accuracy(accuracy: number) {
        this._accuracy = accuracy;
    }

    /**
     * Position unit
     */
    @SerializableMember()
    public get unit(): LengthUnit {
        return this._unit;
    }

    public set unit(unit: LengthUnit) {
        this._unit = unit;
    }

    public get accuracyUnit(): LengthUnit {
        return this._accuracyUnit;
    }

    public set accuracyUnit(accuracyUnit: LengthUnit) {
        this._accuracyUnit = accuracyUnit;
    }

    /**
     * Clone the position
     */
    public clone<T extends Position>(): T {
        const serialized = DataSerializer.serialize(this);
        const clone = DataSerializer.deserialize(serialized) as T;
        return clone;
    }
}
