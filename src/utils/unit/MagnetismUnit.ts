import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';
import { UnitPrefix } from './UnitPrefix';

/**
 * @category Unit
 */
@SerializableObject()
export class MagnetismUnit extends Unit {
    static readonly TESLA: MagnetismUnit = new MagnetismUnit('tesla', {
        baseName: 'magnetism',
        aliases: ['T'],
        prefixes: 'decimal',
    });
    static readonly MICROTESLA: MagnetismUnit = MagnetismUnit.TESLA.specifier(UnitPrefix.MICRO);
}
