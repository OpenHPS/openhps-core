import { SensorValue } from './SensorValue';
import { SerializableObject } from '../decorators';
import { PressureUnit } from '../../utils/unit';

@SerializableObject()
export class Pressure extends SensorValue<PressureUnit> {
    constructor(value = 0, unit = PressureUnit.PASCAL) {
        super(value, undefined, undefined, unit, PressureUnit.PASCAL);
    }

    get value(): number {
        return this.x;
    }

    set value(x: number) {
        this.x = x;
    }
}
