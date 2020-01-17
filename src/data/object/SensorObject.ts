import { DataObject } from "./DataObject";
import { AngleUnit } from "../../utils/unit";

export class SensorObject extends DataObject {
    protected horizontalFOV: number[];
    protected horizontalFOVUnit: AngleUnit = AngleUnit.DEGREES;
    protected verticalFOV: number[];
    protected verticalFOVUnit: AngleUnit = AngleUnit.DEGREES;

    constructor(uid?: string) {
        super(uid);
    }

    public merge(object: SensorObject): SensorObject {
        super.merge(object);
        if (object.getHorizontalFOV() !== undefined)
            this.horizontalFOV = object.horizontalFOV;
        if (object.getVerticalFOV() !== undefined)
            this.verticalFOV = object.verticalFOV;
        return this;
    }

    /**
     * Get horizontal field of view of sensor
     */
    public getHorizontalFOV(): number[] {
        return this.horizontalFOV;
    }

    /**
     * Set horizontal field of view of sensor
     * @param fov Field of view
     * @param unit Field of view units
     */
    public setHorizontalFOV(fov: number[], unit: AngleUnit = AngleUnit.DEGREES): void {
        this.horizontalFOV = fov;
        this.horizontalFOVUnit = unit;
    }

    public getHorizontalFOVUnit(): AngleUnit {
        return this.horizontalFOVUnit;
    }

    public getVerticalFOV(): number[] {
        return this.verticalFOV;
    }

    public setVerticalFOV(fov: number[], unit: AngleUnit = AngleUnit.DEGREES): void {
        this.verticalFOV = fov;
        this.verticalFOVUnit = unit;
    }

    public getVerticalFOVUnit(): AngleUnit {
        return this.verticalFOVUnit;
    }
}
