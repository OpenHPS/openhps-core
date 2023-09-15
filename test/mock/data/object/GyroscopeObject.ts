import { AngularVelocityUnit, SensorObject, SensorValue, SerializableObject } from "../../../../src";

@SerializableObject()
export class GyroscopeObject extends SensorObject {
    raw: SensorValue<AngularVelocityUnit> = new SensorValue();
}
