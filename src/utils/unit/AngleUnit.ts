import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';

/**
 * @category Unit
 */
@SerializableObject()
export class AngleUnit extends Unit {
    static readonly RADIAN: AngleUnit = new AngleUnit('radian', {
        baseName: 'angle',
        aliases: ['rad', 'rads', 'radians'],
    });
    static readonly DEGREE: AngleUnit = new AngleUnit('degree', {
        baseName: 'angle',
        aliases: ['deg', 'degs', 'degrees'],
        definitions: [{ magnitude: Math.PI / 180, unit: 'rad' }],
    });
}
