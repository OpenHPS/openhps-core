import { SerializableObject } from '../decorators';
import { MagnetismUnit, Vector3 } from '../../utils';

@SerializableObject()
export class Magnetism extends Vector3 {
    constructor(x?: number, y?: number, z?: number, unit = MagnetismUnit.MICROTESLA) {
        super(
            unit.convert(x ? x : 0, MagnetismUnit.MICROTESLA),
            unit.convert(y ? y : 0, MagnetismUnit.MICROTESLA),
            unit.convert(z ? z : 0, MagnetismUnit.MICROTESLA),
        );
    }
}
