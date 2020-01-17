import 'reflect-metadata';
import { DataObject, jsonObject, jsonMember } from '../../../../src';

@jsonObject
export class DummyDataObject extends DataObject {
    @jsonMember
    private flag: boolean = false;

}
