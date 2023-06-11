import { AccelerationUnit } from '../../utils';
import { SerializableObject } from '../decorators';
import { SensorValue } from './SensorValue';

/**
 * Acceleration sensor value
 *
 * @category Sensor Value
 */
@SerializableObject()
export class Acceleration extends SensorValue {
    constructor(x = 0, y = 0, z = 0, unit = AccelerationUnit.METER_PER_SECOND_SQUARE) {
        super(x, y, z, unit, AccelerationUnit.METER_PER_SECOND_SQUARE);
    }
}
