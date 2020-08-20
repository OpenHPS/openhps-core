import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';
import { UnitPrefix } from './UnitPrefix';

@SerializableObject()
export class MagnetismUnit extends Unit {
    public static readonly TESLA: MagnetismUnit = new MagnetismUnit('tesla', {
        baseName: 'magnetism',
        aliases: ['T'],
        prefixes: 'decimal',
    });
    public static readonly MICROTESLA: MagnetismUnit = MagnetismUnit.TESLA.specifier(UnitPrefix.MICRO);
}
