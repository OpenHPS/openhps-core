import { SerializableMember, SerializableObject } from '../decorators';
import { Orientation } from '../position';
import { SensorValue } from '../values';
import { DataObject } from './DataObject';

/**
 * A sensor object is a {@link DataObject} that is a sensor with a value.
 */
@SerializableObject()
export abstract class SensorObject extends DataObject {
    /**
     * Value of the sensor
     */
    @SerializableMember()
    // eslint-disable-next-line
    value: SensorValue | Object | Orientation;
    /**
     * Frequency of the sensor
     */
    @SerializableMember()
    frequency: number;

    constructor(uid?: string, displayName?: string) {
        super(uid, displayName);
        this.value = this.value ?? {};
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
