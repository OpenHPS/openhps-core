import { DataObject, SerializableObject, SerializableMember } from '../../../../src';

@SerializableObject()
export class DummyDataFilterObject extends DataObject {
    @SerializableMember()
    public reading: number = 0;

    constructor(uid: string, reading: number) {
        super(uid);
        this.reading = reading;
    }
}
