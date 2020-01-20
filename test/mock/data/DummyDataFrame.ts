import 'reflect-metadata';
import { DataFrame, jsonMember, SerializableObject } from '../../../src';

@SerializableObject()
export class DummyDataFrame extends DataFrame {
    @jsonMember
    public testVariable: number = 54321;
}
