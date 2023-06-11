import { Unit } from './Unit';
import { SerializableMember, SerializableObject } from '../../data/decorators';
import { Vector3 } from '../math/Vector3';

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
export class UnitValue<U extends Unit = Unit, T extends number | Vector3 = number> {
    @SerializableMember({
        name: 'value',
    })
    protected _value!: T;
    @SerializableMember({
        name: 'unit',
    })
    protected _unit!: U;

    constructor(value?: T, unit?: U) {
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
     * @returns {string} Unit value as string
     */
    toString(): string {
        const value = this.valueOf();
        return value ? value.toString() : undefined;
    }

    /**
     * Returns the primitive value
     *
     * @returns {number} Primitive value
     */
    valueOf(): T {
        return this._value;
    }

    setValue(value: T): this {
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
