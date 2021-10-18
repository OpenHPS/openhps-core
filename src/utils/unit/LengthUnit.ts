import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';
import { UnitPrefix } from './UnitPrefix';

/**
 * @category Unit
 */
@SerializableObject()
export class LengthUnit extends Unit {
    static readonly METER = new LengthUnit('meter', {
        baseName: 'length',
        aliases: ['m', 'meters'],
        prefixes: 'decimal',
    });
    static readonly CENTIMETER = LengthUnit.METER.specifier(UnitPrefix.CENTI);
    static readonly MILLIMETER = LengthUnit.METER.specifier(UnitPrefix.MILLI);
    static readonly KILOMETER = LengthUnit.METER.specifier(UnitPrefix.KILO);
    static readonly MILE = new LengthUnit('mile', {
        baseName: 'length',
        aliases: ['mil', 'miles'],
        definitions: [{ unit: 'meter', magnitude: 1609.344 }],
    });
}
