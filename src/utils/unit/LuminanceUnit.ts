import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';

/**
 * @category Unit
 */
@SerializableObject()
export class LuminanceUnit extends Unit {
    static readonly LUMEN: LuminanceUnit = new LuminanceUnit('lumen', {
        baseName: 'luminance',
        aliases: ['lm'],
        prefixes: 'decimal',
    });
}
