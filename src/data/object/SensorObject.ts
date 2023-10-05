import { Unit } from '../../utils';
import { NumberType, SerializableMember, SerializableObject } from '../decorators';
import { Orientation } from '../position';
import { SensorValue } from '../values';
import { DataObject } from './DataObject';

/**
 * Sensor calibration data
 */
@SerializableObject()
// eslint-disable-next-line
export class SensorCalibrationData<T = SensorValue | Object | Orientation> {
    @SerializableMember(() => Unit)
    unit?: Unit;
    @SerializableMember()
    offset?: T;
    @SerializableMember()
    multiplier?: T;
}

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
    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    frequency: number;
    /**
     * Sensor calibration data
     */
    @SerializableMember()
    calibrationData?: SensorCalibrationData<T>;

    constructor(uid?: string, value?: T, frequency?: number, displayName?: string) {
        super(uid, displayName);
        this.value = value ?? ({} as T);
        this.frequency = frequency;
    }

    /**
     * Get the sensor timestamp
     * @returns {number} timestamp
     */
    get timestamp(): number {
        return this.value instanceof SensorValue || this.value instanceof Orientation
            ? this.value.timestamp
            : this.createdTimestamp;
    }

    /**
     * Raw value before calibration
     * @returns {SensorValue | object | Orientation} raw sensor value
     */
    get raw(): T {
        if (this.calibrationData) {
            if (this.value instanceof SensorValue) {
                let result = this.value.clone() as SensorValue;
                const offset = this.calibrationData.offset as unknown as SensorValue;
                const multiplier = this.calibrationData.multiplier as unknown as SensorValue;
                if (multiplier) {
                    result = result.divide(multiplier);
                }
                if (offset) {
                    result = result.sub(offset);
                }
                return result as unknown as T;
            } else {
                return this.value;
            }
        } else if (typeof this.value === 'number') {
            const offset = this.calibrationData.offset as unknown as number;
            const multiplier = this.calibrationData.multiplier as unknown as number;
            return (this.value / (multiplier ?? 1) - (offset ?? 0)) as unknown as T;
        } else {
            return this.value;
        }
    }
    set raw(value: T) {
        if (this.calibrationData) {
            if (value instanceof SensorValue) {
                let result = value.clone() as SensorValue;
                const offset = this.calibrationData.offset as unknown as SensorValue;
                const multiplier = this.calibrationData.multiplier as unknown as SensorValue;
                if (offset) {
                    result = result.add(offset);
                }
                if (multiplier) {
                    result = result.multiply(multiplier);
                }
                this.value = result as unknown as T;
            } else {
                this.value = value;
            }
        } else if (typeof value === 'number') {
            const offset = this.calibrationData.offset as unknown as number;
            const multiplier = this.calibrationData.multiplier as unknown as number;
            this.value = ((value + (offset ?? 0)) * (multiplier ?? 1)) as unknown as T;
        } else {
            this.value = value;
        }
    }
}

export type SensorType = new (uid?: string) => SensorObject;
