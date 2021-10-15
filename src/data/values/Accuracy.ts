import { Unit, UnitValue } from '../../utils';
import { SerializableObject } from '../decorators';

@SerializableObject()
export class Accuracy<U extends Unit = Unit> extends UnitValue<U> {
    /**
     * Set the accuracy as a 1D value
     *
     * @param {number} value Value
     */
    setValue(value: number): this {
        this._value = value;
        return this;
    }

    clone(): this {
        const result = new (this.constructor as new (...args: any[]) => this)();
        result._value = this._value;
        result._unit = this._unit;
        return result;
    }
}
