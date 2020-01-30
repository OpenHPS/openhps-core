import 'reflect-metadata';
import { DataFrame, SerializableObject, SerializableMember, SensorValue, DataObject } from '../../../src';

@SerializableObject()
export class DummySensorDataFrame extends DataFrame {
    @SerializableMember()
    public reading: SensorValue;

    constructor(source: DataObject, value: number) {
        super();
        this.source = source;
        this.reading = new SensorValue(value);
    }
}
