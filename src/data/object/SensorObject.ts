import { SerializableMember, SerializableObject } from '../decorators';
import { SensorValue } from '../values';
import { DataObject } from './DataObject';

export enum SensorType {
    UNKNOWN,
    ACCELEROMETER,
    MAGNETOMETER,
    LINEAR_ACCELERATION,
    AMBIENT_LIGHT_SENSOR,
    GRAVITY_SENSOR,
    GYROSCOPE,
}

/**
 * A sensor object is a {@link DataObject} that is a sensor with a value.
 */
@SerializableObject()
export class SensorObject<T extends SensorType> extends DataObject {
    /**
     * Value of the sensor
     */
    @SerializableMember()
    // eslint-disable-next-line
    value: SensorValue | Object;

    protected sensorType!: T | SensorType;

    constructor(uid?: string, displayName?: string) {
        super(uid, displayName);
        this.value = this.value ?? {};
        this.sensorType = this.sensorType ?? SensorType.UNKNOWN;
    }

    get type(): T {
        return this.sensorType as T;
    }

    @SerializableMember()
    protected set type(value: T) {
        this.sensorType = value;
    }
}
