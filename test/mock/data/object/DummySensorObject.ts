import { DataObject, SerializableObject, SensorObject, AngleUnit } from '../../../../src';

@SerializableObject()
export class DummySensorObject extends DataObject implements SensorObject {
    public horizontalFOV: number[];
    public verticalFOV: number[];
    public fovUnit: AngleUnit;
}
