import 'reflect-metadata';
import { DataObject, jsonMember } from '../../../../src';
import { SerializableObject } from '../../../../src/data/decorators/SerializableObject';

@SerializableObject()
export class DummyDataObject extends DataObject {
    @jsonMember
    private flag: boolean = false;

}
