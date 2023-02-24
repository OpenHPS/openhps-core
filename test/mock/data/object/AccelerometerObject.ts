import { SensorObject, SerializableObject } from "../../../../src";

@SerializableObject()
export class AccelerometerObject extends SensorObject {
    value: {
        x?: number;
        y?: number;
        z?: number;
    };
}
