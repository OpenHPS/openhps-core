import { DataObject } from "./DataObject";
import { AngleUnit, Unit } from "../../utils/unit";

export interface SensorObject extends DataObject {
   
    /**
     * Horizontal field of view of the sensor
     */
    horizontalFOV: number[];

    /**
     * Vertical field of view of the sensor
     */
    verticalFOV: number[];

    /**
     * Field of view unit
     */
    fovUnit: AngleUnit;
}
