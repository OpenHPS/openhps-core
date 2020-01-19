import 'reflect-metadata';
import { DataObject } from "./DataObject";
import { AngleUnit } from "../../utils/unit";
import { jsonObject } from "typedjson";

@jsonObject
export class SensorObject extends DataObject {
    private _horizontalFOV: number[];
    private _horizontalFOVUnit: AngleUnit = AngleUnit.DEGREES;
    private _verticalFOV: number[];
    private _verticalFOVUnit: AngleUnit = AngleUnit.DEGREES;

    constructor(uid?: string) {
        super(uid);
    }

    public merge(object: SensorObject): SensorObject {
        super.merge(object);
        if (object.horizontalFOV !== undefined)
            this._horizontalFOV = object._horizontalFOV;
        if (object.verticalFOV !== undefined)
            this._verticalFOV = object._verticalFOV;
        return this;
    }

    /**
     * Get horizontal field of view of sensor
     */
    public get horizontalFOV(): number[] {
        return this._horizontalFOV;
    }

    /**
     * Set horizontal field of view of sensor
     * @param fov Field of view
     */
    public set horizontalFOV(fov: number[]) {
        this._horizontalFOV = fov;
    }

    public get horizontalFOVUnit(): AngleUnit {
        return this._horizontalFOVUnit;
    }

    public set horizontalFOVUnit(unit: AngleUnit) {
        this._horizontalFOVUnit = unit;
    }

    public get verticalFOV(): number[] {
        return this._verticalFOV;
    }

    public set verticalFOV(fov: number[]) {
        this._verticalFOV = fov;
    }

    public get verticalFOVUnit(): AngleUnit {
        return this._verticalFOVUnit;
    }

    public set verticalFOVUnit(unit: AngleUnit) {
        this._verticalFOVUnit = unit;
    }

}
