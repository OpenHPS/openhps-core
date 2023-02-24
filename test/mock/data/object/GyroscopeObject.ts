import { AngularVelocityUnit, SensorType, SensorObject, SensorValue, SerializableObject } from "../../../../src";

@SerializableObject()
export class GyroscopeObject extends SensorObject<SensorType.GYROSCOPE> {
    protected sensorType = SensorType.GYROSCOPE;
    value: SensorValue<AngularVelocityUnit> = new SensorValue();
}
