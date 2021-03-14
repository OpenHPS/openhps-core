import { Vector3, AccelerationUnit } from '../../utils';
import { SerializableMember, SerializableObject } from '../decorators';

/**
 * @category Position
 */
@SerializableObject()
export class Acceleration extends Vector3 {
    @SerializableMember({
        isRequired: false,
    })
    public accuracy: number;

    constructor(x = 0, y = 0, z = 0, unit = AccelerationUnit.METER_PER_SECOND_SQUARE) {
        super(x, y, z, unit, AccelerationUnit.METER_PER_SECOND_SQUARE);
    }
}
