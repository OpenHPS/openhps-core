import { SerializableObject } from '../../decorators';
import { Magnetism } from '../../values';
import { SensorObject } from '../SensorObject';

/**
 * The magnetometer sensor provides information about the magnetic field as detected by the device's primary magnetometer sensor.
 * @category data
 */
@SerializableObject()
export class Magnetometer extends SensorObject<Magnetism> {
    constructor(uid?: string, value?: Magnetism, frequency?: number, displayName?: string) {
        super(uid, value ?? new Magnetism(), frequency, displayName);
    }
}
