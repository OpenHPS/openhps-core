import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';

/**
 * @category Unit
 */
@SerializableObject()
export class PressureUnit extends Unit {
    static readonly PASCAL: PressureUnit = new PressureUnit('pascal', {
        baseName: 'pressure',
        aliases: ['P'],
        prefixes: 'decimal',
    });
}
