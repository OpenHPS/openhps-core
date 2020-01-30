import 'reflect-metadata';
import { DataObject } from "./DataObject";
import { AngleUnit, Unit } from "../../utils/unit";
import { SensorValue } from '../../utils';

export interface SensorObject extends DataObject {
   
    /**
     * Horizontal field of view of the sensor
     */
    horizontalFOV: number[];

    horizontalFOVUnit(): AngleUnit;

    verticalFOV(): number[];

    verticalFOVUnit(): AngleUnit;

    values: Map<string, SensorValue<any>>;

}
