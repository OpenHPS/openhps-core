import { SerializableObject, SerializableMember } from "../data/decorators";
import { Unit } from "./unit";

@SerializableObject()
export class SensorValue<T, U extends Unit> {
    @SerializableMember()
    private _raw: T;
    @SerializableMember()
    private _unit: U;

    public get unit(): U {
        return this._unit;
    }

    public set unit(unit: U) {
        this._unit = unit;
    }

    public get raw(): T {
        return this._raw;
    }

    public set raw(value: T) {
        this._raw = value;
    }
}
