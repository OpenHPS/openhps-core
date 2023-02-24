import { Vector3 } from '../../utils';
import { AngularVelocityUnit } from '../../utils/unit/AngularVelocityUnit';
import { SerializableObject } from '../decorators';
import { SensorValue } from './SensorValue';

/**
 * @category Sensor Value
 */
@SerializableObject()
export class AngularVelocity extends SensorValue<AngularVelocityUnit> {
    constructor(x?: number, y?: number, z?: number, unit = AngularVelocityUnit.RADIAN_PER_SECOND) {
        super(x, y, z, unit, AngularVelocityUnit.RADIAN_PER_SECOND);
    }

    static fromArray<T extends Vector3>(
        this: new (...args: any[]) => T,
        array: number[],
        unit: AngularVelocityUnit = AngularVelocityUnit.RADIAN_PER_SECOND,
    ): T {
        return new this(array[0], array[1], array[2], unit) as T;
    }
}
