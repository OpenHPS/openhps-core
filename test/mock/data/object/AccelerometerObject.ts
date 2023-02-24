import { SensorType, SensorObject, SerializableObject } from "../../../../src";

@SerializableObject()
export class AccelerometerObject extends SensorObject<SensorType.ACCELEROMETER> {
    protected sensorType = SensorType.ACCELEROMETER;
    value: {
        x?: number;
        y?: number;
        z?: number;
    };
}
