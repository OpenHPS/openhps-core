import { SerializableObject } from '../../decorators';
import { Acceleration } from '../../values';
import { SensorObject } from '../SensorObject';

/**
 * The gravity sensor provides on each reading the gravity applied to the device along all three axes.
 *
 * @category data
 */
@SerializableObject()
export class GravitySensor extends SensorObject {
    value: Acceleration = new Acceleration();
}
