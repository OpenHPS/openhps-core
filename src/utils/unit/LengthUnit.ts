import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';
import { UnitPrefix } from './UnitPrefix';

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
}
