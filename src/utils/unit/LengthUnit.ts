import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';
import { UnitPrefix } from './UnitPrefix';

/**
 * @category Unit
 */
@SerializableObject()
export class LengthUnit extends Unit {
    public static readonly METER = new LengthUnit('meter', {
        baseName: 'length',
        aliases: ['m', 'meters'],
        prefixes: 'decimal',
    });
    public static readonly CENTIMETER = LengthUnit.METER.specifier(UnitPrefix.CENTI);
    public static readonly MILLIMETER = LengthUnit.METER.specifier(UnitPrefix.MILLI);
    public static readonly KILOMETER = LengthUnit.METER.specifier(UnitPrefix.KILO);
    public static readonly MILE = new LengthUnit('mile', {
        baseName: 'length',
        aliases: ['mil', 'miles'],
        definitions: [{ unit: 'meter', magnitude: 1609.344 }],
    });
}
