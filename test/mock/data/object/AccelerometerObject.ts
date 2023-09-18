import { SensorObject, SerializableObject, Vector3 } from "../../../../src";

@SerializableObject()
export class AccelerometerObject extends SensorObject<Vector3> {
    value = new Vector3()
}
