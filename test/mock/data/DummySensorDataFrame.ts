import { DataFrame, SerializableObject, SerializableMember, DataObject } from '../../../src';

@SerializableObject()
export class DummySensorDataFrame extends DataFrame {
    @SerializableMember()
    public reading: number;

    constructor(source: DataObject, value: number) {
        super();
        this.source = source;
        this.reading = value;
    }
}
