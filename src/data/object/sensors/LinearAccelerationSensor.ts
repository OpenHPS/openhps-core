import { SerializableObject } from '../../decorators';
import { LinearVelocity } from '../../values';
import { SensorObject } from '../SensorObject';

/**
 * The linear acceleration sensor provides on each reading the acceleration applied to the device along all three axes, but without the contribution of gravity.
 *
 * @category data
 */
@SerializableObject()
export class LinaerAccelerationSensor extends SensorObject {
    value: LinearVelocity = new LinearVelocity();
}
