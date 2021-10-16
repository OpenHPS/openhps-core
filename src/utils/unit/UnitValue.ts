import { SerializableMember, SerializableObject } from '../../data/decorators';
import { Unit } from './Unit';

/**
 * Unit value
 *
 * ## Usage
 * ### Creation
 * ```typescript
 * const value = new UnitValue(5, LengthUnit.METER);
 * ```
 *
 * ### Conversion
 * ```typescript
 * const value = new UnitValue(5, LengthUnit.METER);
 * const converted = value.to(LengthUnit.CENTIMETER);
 * ```
 *
 * @category Unit
 */
@SerializableObject()
export class UnitValue<U extends Unit = Unit> implements Number {
    @SerializableMember({
        name: "value"
    })
    protected _value: number;
    @SerializableMember({
        constructor: Unit,
        name: "unit"
    })
    protected _unit!: U;

    constructor(value?: number, unit?: U) {
        this._value = value;
        this._unit = unit;
    }

    /**
     * Convert the value to another unit
     *
     * @param {Unit} unit Target unit
     * @returns {UnitValue} Converted value
     */
    to<T extends Unit>(unit: T): this {
        if (!unit) {
            throw new Error(`${this.constructor.name} does not have a unit to convert from!`);
        }
        const result = this.unit.convert(this.valueOf(), unit);
        return new (this.constructor as new (...args: any[]) => this)(result, unit);
    }

    /**
     * Unit this value is in
     *
     * @returns {Unit} Unit this value is in
     */
    get unit(): U {
        return this._unit;
    }

    /**
     * Returns a string representation of an object.
     *
     * @param {number} radix specifies a radix for converting numeric values to strings. This value is only used for numbers.
     * @returns {string} Unit value as string
     */
    toString(radix?: number): string {
        return this.valueOf().toString(radix);
    }

    /**
     * Returns a string representing a number in fixed-point notation.
     *
     * @param {number} fractionDigits of digits after the decimal point. Must be in the range 0 - 20, inclusive.
     * @returns {string} Fixed number
     */
    toFixed(fractionDigits?: number): string {
        return this.valueOf().toFixed(fractionDigits);
    }

    /**
     * Returns a string containing a number represented in exponential notation.
     *
     * @param {number} fractionDigits of digits after the decimal point. Must be in the range 0 - 20, inclusive.
     * @returns {string} Exponential string
     */
    toExponential(fractionDigits?: number): string {
        return this.valueOf().toExponential(fractionDigits);
    }

    /**
     * Returns a string containing a number represented either in exponential or fixed-point notation with a specified number of digits.
     *
     * @param {number} precision Number of significant digits. Must be in the range 1 - 21, inclusive.
     * @returns {string} Precision string
     */
    toPrecision(precision?: number): string {
        return this.valueOf().toPrecision(precision);
    }

    /**
     * Returns the primitive value
     *
     * @returns {number} Primitive value
     */
    valueOf(): number {
        return this._value;
    }

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
