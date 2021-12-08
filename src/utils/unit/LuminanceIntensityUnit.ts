import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';

/**
 * @category Unit
 */
@SerializableObject()
export class LuminanceIntensityUnit extends Unit {
    static readonly CANDELA: LuminanceUnit = new LuminanceUnit('candela', {
        baseName: 'pressure',
        aliases: ['P'],
        prefixes: 'decimal',
    });
}
