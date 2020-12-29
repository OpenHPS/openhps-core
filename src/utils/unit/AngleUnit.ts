import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';

@SerializableObject()
export class AngleUnit extends Unit {
    public static readonly RADIAN: AngleUnit = new AngleUnit('radian', {
        baseName: 'angle',
        aliases: ['rad', 'rads', 'radians'],
    });
    public static readonly DEGREE: AngleUnit = new AngleUnit('degree', {
        baseName: 'angle',
        aliases: ['deg', 'degs', 'degrees'],
        definitions: [{ magnitude: Math.PI / 180, unit: 'rad' }],
    });
}
