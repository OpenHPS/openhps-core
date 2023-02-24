import { SerializableObject } from '../../decorators';
import { Acceleration } from '../../values';
import { SensorObject } from '../SensorObject';

/**
 * The linear acceleration sensor provides on each reading the acceleration applied to the device along all three axes, but without the contribution of gravity.
 *
 * @category data
 */
@SerializableObject()
export class LinearAccelerationSensor extends SensorObject {
    value: Acceleration = new Acceleration();
}
