import { SerializableObject } from '../decorators';
import { LinearVelocityUnit } from '../../utils';
import { SensorValue } from './SensorValue';

/**
 * @category Sensor Value
 */
@SerializableObject()
export class LinearVelocity extends SensorValue {
    constructor(x?: number, y?: number, z?: number, unit = LinearVelocityUnit.METER_PER_SECOND) {
        super(x, y, z, unit, LinearVelocityUnit.METER_PER_SECOND);
    }

    static fromArray(array: number[], unit: LinearVelocityUnit = LinearVelocityUnit.METER_PER_SECOND): LinearVelocity {
        return new LinearVelocity(array[0], array[1], array[2], unit);
    }
}
