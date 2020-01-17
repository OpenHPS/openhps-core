import 'reflect-metadata';
import { DataFrame, jsonObject, jsonMember } from '../../../src';

@jsonObject
export class DummyDataFrame extends DataFrame {
    @jsonMember
    public testVariable: number = 54321;
}
