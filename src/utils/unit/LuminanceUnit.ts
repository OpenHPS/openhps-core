import { DerivedUnit } from './DerivedUnit';
import { SerializableObject } from '../../data/decorators';

/**
 * @category Unit
 */
@SerializableObject()
export class LuminanceUnit extends DerivedUnit {
    static readonly LUX = new LuminanceUnit('lux', {
        baseName: 'luminance',
        aliases: ['lx'],
    });
}
