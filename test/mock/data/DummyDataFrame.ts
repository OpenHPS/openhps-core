import 'reflect-metadata';
import { DataFrame, SerializableObject, SerializableMember, SensorValue } from '../../../src';

@SerializableObject()
export class DummyDataFrame extends DataFrame {
    @SerializableMember()
    public testVariable: number = 54321;
}
