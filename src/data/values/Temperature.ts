import { TemperatureUnit } from '../../utils/unit';
import { SerializableObject } from '../decorators';
import { SensorValue } from './SensorValue';

/**
 * @category Sensor Value
 */
@SerializableObject()
export class Temperature extends SensorValue<TemperatureUnit> {
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
