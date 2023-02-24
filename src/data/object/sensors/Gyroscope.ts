import { SerializableObject } from '../../decorators';
import { AngularVelocity } from '../../values';
import { SensorObject } from '../SensorObject';

/**
 * The gyroscope provides on each reading the angular velocity of the device along all three axes.
 *
 * @category data
 */
@SerializableObject()
export class Gyroscope extends SensorObject {
    value: AngularVelocity = new AngularVelocity();
}
