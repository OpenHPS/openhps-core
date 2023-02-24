import { SerializableMember, SerializableObject } from '../decorators';
import { Orientation } from '../position';
import { SensorValue } from '../values';
import { DataObject } from './DataObject';

/**
 * A sensor object is a {@link DataObject} that is a sensor with a value.
 */
@SerializableObject()
// eslint-disable-next-line
export abstract class SensorObject<T = SensorValue | Object | Orientation> extends DataObject {
    /**
     * Value of the sensor
     */
    @SerializableMember()
    value: T;
    /**
     * Frequency of the sensor
     */
    @SerializableMember()
    frequency: number;

    constructor(uid?: string, value?: T, displayName?: string, frequency?: number) {
        super(uid, displayName);
        this.value = value ?? ({} as T);
        this.frequency = frequency;
    }

    /**
     * Get the sensor timestamp
     *
     * @returns {number} timestamp
     */
    get timestamp(): number {
        return this.value instanceof SensorValue || this.value instanceof Orientation
            ? this.value.timestamp
            : this.createdTimestamp;
    }
}
