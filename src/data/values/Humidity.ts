import { SensorValue } from './SensorValue';
import { SerializableObject } from '../decorators';
import { Unit } from '../../utils/unit';

@SerializableObject()
export class Humidity extends SensorValue<Unit> {
    constructor(value = 0) {
        super(value, undefined, undefined);
    }

    get value(): number {
        return this.x;
    }

    set value(x: number) {
        this.x = x;
    }
}
