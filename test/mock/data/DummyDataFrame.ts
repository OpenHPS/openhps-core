import 'reflect-metadata';
import { DataFrame, SerializableObject, SerializableMember } from '../../../src';

@SerializableObject()
export class DummyDataFrame extends DataFrame {
    @SerializableMember()
    public testVariable: number = 54321;
}
