import { DataObject } from "./DataObject";
import { AngleUnit } from "../../utils/unit";

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
        if (object.getHorizontalFOV() !== undefined)
            this._horizontalFOV = object._horizontalFOV;
        if (object.getVerticalFOV() !== undefined)
            this._verticalFOV = object._verticalFOV;
        return this;
    }

    /**
     * Get horizontal field of view of sensor
     */
    public getHorizontalFOV(): number[] {
        return this._horizontalFOV;
    }

    /**
     * Set horizontal field of view of sensor
     * @param fov Field of view
     * @param unit Field of view units
     */
    public setHorizontalFOV(fov: number[], unit: AngleUnit = AngleUnit.DEGREES): void {
        this._horizontalFOV = fov;
        this._horizontalFOVUnit = unit;
    }

    public getHorizontalFOVUnit(): AngleUnit {
        return this._horizontalFOVUnit;
    }

    public getVerticalFOV(): number[] {
        return this._verticalFOV;
    }

    public setVerticalFOV(fov: number[], unit: AngleUnit = AngleUnit.DEGREES): void {
        this._verticalFOV = fov;
        this._verticalFOVUnit = unit;
    }

    public getVerticalFOVUnit(): AngleUnit {
        return this._verticalFOVUnit;
    }
}
