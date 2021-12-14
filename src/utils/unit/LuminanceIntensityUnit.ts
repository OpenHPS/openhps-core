import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';

/**
 * @category Unit
 */
@SerializableObject()
export class LuminanceIntensityUnit extends Unit {
    static readonly CANDELA: LuminanceIntensityUnit = new LuminanceIntensityUnit('candela', {
        baseName: 'luminanceintensity',
        aliases: ['cd'],
    });
}
