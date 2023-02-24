import { SerializableObject } from '../decorators';
import { LinearVelocityUnit, Vector3 } from '../../utils';
import { SensorValue } from './SensorValue';

/**
 * @category Sensor Value
 */
@SerializableObject()
export class LinearVelocity extends SensorValue<LinearVelocityUnit> {
    constructor(x?: number, y?: number, z?: number, unit = LinearVelocityUnit.METER_PER_SECOND) {
        super(x, y, z, unit, LinearVelocityUnit.METER_PER_SECOND);
    }

    static fromArray<T extends Vector3>(
        this: new (...args: any[]) => T,
        array: number[],
        unit: LinearVelocityUnit = LinearVelocityUnit.METER_PER_SECOND,
    ): T {
        return new this(array[0], array[1], array[2], unit) as T;
    }
}
