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
export class UnitValue implements Number {
    private _value: number;
    private _unit: Unit;

    constructor(value: number, unit: Unit) {
        this._value = value;
        this._unit = unit;
    }

    /**
     * Convert the value to another unit
     *
     * @param {Unit} unit Target unit
     * @returns {UnitValue} Converted value
     */
    public to(unit: Unit): UnitValue {
        const result = this.unit.convert(this.valueOf(), unit);
        return new UnitValue(result, unit);
    }

    /**
     * Unit this value is in
     *
     * @returns {Unit} Unit this value is in
     */
    public get unit(): Unit {
        return this._unit;
    }

    /**
     * Returns a string representation of an object.
     *
     * @param {number} radix specifies a radix for converting numeric values to strings. This value is only used for numbers.
     * @returns {string} Unit value as string
     */
    public toString(radix?: number): string {
        return this._value.toString(radix);
    }

    /**
     * Returns a string representing a number in fixed-point notation.
     *
     * @param {number} fractionDigits of digits after the decimal point. Must be in the range 0 - 20, inclusive.
     * @returns {string} Fixed number
     */
    public toFixed(fractionDigits?: number): string {
        return this._value.toFixed(fractionDigits);
    }

    /**
     * Returns a string containing a number represented in exponential notation.
     *
     * @param {number} fractionDigits of digits after the decimal point. Must be in the range 0 - 20, inclusive.
     * @returns {string} Exponential string
     */
    public toExponential(fractionDigits?: number): string {
        return this._value.toExponential(fractionDigits);
    }

    /**
     * Returns a string containing a number represented either in exponential or fixed-point notation with a specified number of digits.
     *
     * @param {number} precision Number of significant digits. Must be in the range 1 - 21, inclusive.
     * @returns {string} Precision string
     */
    public toPrecision(precision?: number): string {
        return this._value.toPrecision(precision);
    }

    /**
     * Returns the primitive value
     *
     * @returns {number} Primitive value
     */
    public valueOf(): number {
        return this._value.valueOf();
    }
}
