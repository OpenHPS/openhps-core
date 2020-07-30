import { LengthUnit } from "../../utils";
import { SerializableObject, SerializableMember } from "../decorators";
import { DataSerializer } from "../DataSerializer";

/**
 * General abstract position class consisting of orientation, velocity, position unit and an accuracy.
 */
@SerializableObject()
export abstract class Position {
    private _accuracy: number;
    private _timestamp: number = new Date().getTime();
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
     * Position accuracy
     */
    @SerializableMember()
    public get accuracy(): number {
        return this._accuracy;
    }

    public set accuracy(accuracy: number) {
        this._accuracy = accuracy;
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
