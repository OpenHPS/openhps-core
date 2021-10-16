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
}
