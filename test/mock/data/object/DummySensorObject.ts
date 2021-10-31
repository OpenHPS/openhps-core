import { DataObject, SerializableObject, AngleUnit } from '../../../../src';
import { DummyDataObject } from './DummyDataObject';

@SerializableObject()
export class DummySensorObject extends DummyDataObject {
    public horizontalFOV: number;
    public verticalFOV: number;
    public fovUnit: AngleUnit;
}
