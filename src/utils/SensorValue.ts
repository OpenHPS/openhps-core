import { SerializableObject, SerializableMember } from "../data/decorators";
import { Unit } from "./unit";
import { AbstractUnit } from "./unit/_internal/AbstractUnit";

@SerializableObject()
export class SensorValue {
    @SerializableMember()
    private _raw: number;
    @SerializableMember()
    private _unit: Unit;
    @SerializableMember()
    private _filtered: number = undefined;

    constructor(raw: number, unit: Unit = AbstractUnit.UNKNOWN) {
        this.raw = raw;
        this.unit = unit;
    }

    public get unit(): Unit {
        return this._unit;
    }

    public set unit(unit: Unit) {
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
