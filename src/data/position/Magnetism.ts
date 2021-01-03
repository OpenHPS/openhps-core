import { SerializableMember, SerializableObject } from '../decorators';
import { MagnetismUnit, Vector3 } from '../../utils';

/**
 *
 */
@SerializableObject()
export class Magnetism extends Vector3 {
    @SerializableMember({
        isRequired: false,
    })
    public accuracy: number;

    constructor(x?: number, y?: number, z?: number, unit = MagnetismUnit.MICROTESLA) {
        super(x, y, z, unit, MagnetismUnit.MICROTESLA);
    }
}
