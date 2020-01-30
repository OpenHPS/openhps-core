import { SerializableObject, SerializableMember } from "../data/decorators";
import { Unit } from "./unit";

@SerializableObject()
export class SensorValue<U extends Unit> {
    @SerializableMember()
    private _raw: number;
    @SerializableMember()
    private _unit: U;
    @SerializableMember()
    private _filtered: number = undefined;

    constructor(raw: number, unit: U) {
        this.raw = raw;
        this.unit = unit;
    }

    public get unit(): U {
        return this._unit;
    }

    public set unit(unit: U) {
        this._unit = unit;
    }

    public get raw(): number {
        return this._raw;
    }

    public set raw(value: number) {
        this._raw = value;
    }

    public get filtered(): number {
        return this._filtered;
    }

    public set filtered(value: number) {
        this._filtered = value;
    }

    public isFiltered(): boolean {
        return this._filtered !== undefined;
    }
}
