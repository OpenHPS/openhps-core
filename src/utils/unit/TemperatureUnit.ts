import { Unit } from './Unit';
import { SerializableObject } from '../../data/decorators';

/**
 * @category Unit
 */
@SerializableObject()
export class TemperatureUnit extends Unit {
    static readonly CELCIUS = new TemperatureUnit('celcius', {
        baseName: 'temperature',
    });
    static readonly FAHRENHEIT = new TemperatureUnit('fahrenheit', {
        baseName: 'temperature',
        definitions: [{ unit: 'celcius', offset: -32, magnitude: 5 / 9 }],
    });
    static readonly KELVIN = new TemperatureUnit('kelvin', {
        baseName: 'temperature',
        definitions: [{ unit: 'celcius', offset: -273.15 }],
    });
    static readonly RANKINE = new TemperatureUnit('rankine', {
        baseName: 'temperature',
        definitions: [{ unit: 'kelvin', magnitude: 1 / 1.8 }],
    });
}
