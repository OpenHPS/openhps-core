import { SerializableObject } from '../../decorators';
import { Magnetism } from '../../values';
import { SensorObject } from '../SensorObject';

/**
 * The magnetometer sensor provides information about the magnetic field as detected by the device's primary magnetometer sensor.
 *
 * @category data
 */
@SerializableObject()
export class Magnetometer extends SensorObject {
    value: Magnetism = new Magnetism();
}
