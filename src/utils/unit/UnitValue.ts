import { Unit } from "./Unit";

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
 */
export class UnitValue implements Number {
    private _value: Number;
    private _unit: Unit;

    constructor(value: any, unit: Unit) {
        this._value = Number(value);
        this._unit = unit;
    }

    public to(unit: Unit): UnitValue {
        const result = this.unit.convert(this.valueOf(), unit);
        return new UnitValue(result, unit);
    }

    public get unit(): Unit {
        return this._unit;
    }

    /**
     * Returns a string representation of an object.
     * @param radix Specifies a radix for converting numeric values to strings. This value is only used for numbers.
     */
    public toString(radix?: number): string {
        return this._value.toString(radix);
    }

    /**
     * Returns a string representing a number in fixed-point notation.
     * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
     */
    public toFixed(fractionDigits?: number): string {
        return this._value.toFixed(fractionDigits);
    }

    /**
     * Returns a string containing a number represented in exponential notation.
     * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
     */
    public toExponential(fractionDigits?: number): string {
        return this._value.toExponential(fractionDigits);
    }

    /**
     * Returns a string containing a number represented either in exponential or fixed-point notation with a specified number of digits.
     * @param precision Number of significant digits. Must be in the range 1 - 21, inclusive.
     */
    public toPrecision(precision?: number): string {
        return this._value.toPrecision(precision);
    }

    /**
     * Returns the primitive value
     */
    public valueOf(): number {
        return this._value.valueOf();
    }

}
