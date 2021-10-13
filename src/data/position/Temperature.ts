import { TemperatureUnit } from '../../utils';
import { SerializableObject } from '../decorators';
import { SensorValue } from './SensorValue';

/**
 * @category Position
 */
@SerializableObject()
export class Temperature extends SensorValue {
    constructor(value = 0, unit = TemperatureUnit.CELCIUS) {
        super(value, undefined, undefined, unit, TemperatureUnit.CELCIUS);
    }

    get value(): number {
        return this.x;
    }

    set value(x: number) {
        this.x = x;
    }
}
