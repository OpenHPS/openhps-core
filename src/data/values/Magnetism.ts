import { SerializableObject, SerializableMember } from '../decorators';
import { MagnetismUnit } from '../../utils';
import { SensorValue } from './SensorValue';

/**
 * @category Sensor Value
 */
@SerializableObject()
export class Magnetism extends SensorValue {
    @SerializableMember()
    unit!: MagnetismUnit;

    constructor(x?: number, y?: number, z?: number, unit = MagnetismUnit.MICROTESLA) {
        super(x, y, z, unit, MagnetismUnit.MICROTESLA);
    }
}
