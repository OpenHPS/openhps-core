import 'reflect-metadata';
import { DataObject, SerializableObject, SerializableMember } from '../../../../src';

@SerializableObject()
export class DummyDataObject extends DataObject {
    @SerializableMember()
    private flag: boolean = false;

}
