import { SerializableObject } from '../../data/decorators';
import { DerivedUnit } from './DerivedUnit';
import { LengthUnit } from './LengthUnit';
import { TimeUnit } from './TimeUnit';

@SerializableObject()
export class AccelerationUnit extends DerivedUnit {
    public static readonly METER_PER_SECOND_SQUARE = new AccelerationUnit('meter per second squared', {
        baseName: 'acceleration',
        aliases: ['m/s^2', 'm/s2', 'meters per second squared'],
    })
        .addUnit(LengthUnit.METER, 1)
        .addUnit(TimeUnit.SECOND, -2);

    public static readonly GRAVITATIONAL_FORCE = new AccelerationUnit('gravitational force', {
        baseName: 'acceleration',
        aliases: ['g-force', 'G', 'GS'],
        definitions: [{ magnitude: 9.78033, unit: 'm/s^2' }],
    });
}
