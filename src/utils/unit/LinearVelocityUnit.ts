import { SerializableObject } from '../../data/decorators';
import { DerivedUnit } from './DerivedUnit';
import { LengthUnit } from './LengthUnit';
import { TimeUnit } from './TimeUnit';

/**
 * @category Unit
 */
@SerializableObject()
export class LinearVelocityUnit extends DerivedUnit {
    public static readonly METER_PER_SECOND = new LinearVelocityUnit('meter per second', {
        baseName: 'linearvelocity',
        aliases: ['m/s', 'meters per second'],
    })
        .addUnit(LengthUnit.METER, 1)
        .addUnit(TimeUnit.SECOND, -1);
    public static readonly CENTIMETER_PER_SECOND = LinearVelocityUnit.METER_PER_SECOND.swap([LengthUnit.CENTIMETER], {
        baseName: 'linearvelocity',
        name: 'centimeter per minute',
        aliases: ['cm/min', 'centimeters per minute'],
    });
}
