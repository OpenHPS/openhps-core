import { SerializableObject } from '../../decorators';
import { Orientation } from '../../position';
import { SensorObject } from '../SensorObject';

/**
 * Absolute orientation sensor describes the device's physical orientation in relation to the Earth's reference coordinate system.
 *
 * @category data
 */
@SerializableObject()
export class AbsoluteOrientationSensor extends SensorObject {
    value: Orientation = new Orientation();
}
