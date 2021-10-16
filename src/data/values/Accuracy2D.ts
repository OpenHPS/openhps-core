import { Unit } from '../../utils';
import { Vector3 } from '../../utils/math/';
import { SerializableObject } from '../decorators';
import { Accuracy } from './Accuracy';

@SerializableObject()
export class Accuracy2D<U extends Unit = Unit> extends Accuracy<U, Vector3> {
    constructor(x?: number, y?: number, unit?: U) {
        super(new Vector3(), unit);
        this.valueOf().x = x;
        this.valueOf().y = y;
    }

    /**
     * Convert the value to another unit
     *
     * @param {Unit} unit Target unit
     * @returns {Vector2} Converted value
     */
    to<T extends Unit>(unit: T): this {
        const accuracy = super.to(unit) as this;
        accuracy.x = this.unit.convert(this.x, unit);
        accuracy.y = this.unit.convert(this.y, unit);
        return accuracy;
    }

    get x(): number {
        return this._value.x;
    }

    set x(val: number) {
        this._value.x = val;
    }

    get y(): number {
        return this._value.y;
    }

    set y(val: number) {
        this._value.y = val;
    }
}
