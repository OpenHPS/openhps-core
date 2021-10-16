import { Unit } from '../../utils';
import { Vector2 } from '../../utils/math/';
import { SerializableMember, SerializableObject } from '../decorators';
import { Accuracy } from './Accuracy';

@SerializableObject()
export class Accuracy2D<U extends Unit = Unit> extends Accuracy<U> {
    @SerializableMember({
        name: "vector"
    })
    private _vector: Vector2 = new Vector2();

    constructor(x?: number, y?: number, unit?: U) {
        super(x + y / 2, unit);
        this._vector.x = x;
        this._vector.y = y;
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

    private _updateValue(): void {
        this._value = this.x + this.y / 2;
    }

    get x(): number {
        return this._vector.x;
    }

    set x(val: number) {
        this._vector.x = val;
        this._updateValue();
    }

    get y(): number {
        return this._vector.y;
    }

    set y(val: number) {
        this._vector.y = val;
        this._updateValue();
    }

    clone(): this {
        const result = super.clone();
        result._vector = this._vector.clone();
        return result;
    }
}
