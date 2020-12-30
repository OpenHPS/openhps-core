import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';
import { UnitPrefix } from './UnitPrefix';

/**
 * @category Unit
 */
@SerializableObject()
export class TimeUnit extends Unit {
    public static readonly SECOND = new TimeUnit('second', {
        baseName: 'time',
        aliases: ['s', 'sec', 'seconds'],
        prefixes: 'decimal',
    });
    public static readonly MILLISECOND = TimeUnit.SECOND.specifier(UnitPrefix.MILLI);
    public static readonly MICROSECOND = TimeUnit.SECOND.specifier(UnitPrefix.MICRO);
    public static readonly NANOSECOND = TimeUnit.SECOND.specifier(UnitPrefix.NANO);
    public static readonly MINUTE = new TimeUnit('minute', {
        baseName: 'time',
        aliases: ['m', 'min', 'minutes'],
        definitions: [{ magnitude: 60, unit: 's' }],
    });
    public static readonly HOUR = new TimeUnit('hour', {
        baseName: 'time',
        aliases: ['h', 'hr', 'hrs', 'hours'],
        definitions: [
            { magnitude: 3600, unit: 's' },
            { magnitude: 60, unit: 'min' },
        ],
    });
}
