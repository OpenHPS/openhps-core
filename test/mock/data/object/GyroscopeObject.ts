import { AngularVelocityUnit, SensorObject, SensorValue, SerializableObject } from "../../../../src";

@SerializableObject()
export class GyroscopeObject extends SensorObject {
    value: SensorValue<AngularVelocityUnit> = new SensorValue();
}
