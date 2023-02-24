import { SerializableObject } from '../../decorators';
import { Orientation } from '../../position';
import { SensorObject } from '../SensorObject';

/**
 * The relative orientation sensor describes the device's physical orientation without regard to the Earth's reference coordinate system.
 *
 * @category data
 */
@SerializableObject()
export class RelativeOrientationSensor extends SensorObject {
    value: Orientation = new Orientation();
}
