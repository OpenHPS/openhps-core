import { SerializableObject } from '../../decorators';
import { Acceleration } from '../../values';
import { SensorObject } from '../SensorObject';

/**
 * Accelerometer sensor provides on each reading the acceleration applied to the device along all three axes including gravity.
 *
 * @category data
 */
@SerializableObject()
export class Accelerometer extends SensorObject {
    value: Acceleration = new Acceleration();
}