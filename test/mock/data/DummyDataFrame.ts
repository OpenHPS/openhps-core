import 'reflect-metadata';
import { DataFrame, SerializableObject, SerializableMember, SerializableMapMember, SerializableSetMember } from '../../../src';

@SerializableObject()
export class DummyDataFrame extends DataFrame {
    @SerializableMember()
    public testVariable: number = 54321;
    @SerializableMapMember(String, Object)
    public testMap: Map<string, Object> = new Map();
    @SerializableSetMember(String)
    public testSet: Set<string> = new Set();
}
