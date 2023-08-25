import { Unit } from '../../utils/unit';
import { Vector3 } from '../../utils/math/Vector3';
import { SerializableObject, SerializableMember } from '../decorators';

@SerializableObject()
export abstract class Accuracy<U extends Unit = Unit, T extends number | Vector3 | any = number> {
    @SerializableMember()
    value: T;
    @SerializableMember({
        name: 'unit',
        constructor: () => Unit
    })
    protected _unit!: U;

    constructor(value?: T, unit?: U) {
        this.value = value;
        this._unit = unit;
    }

    /**
     * Convert the value to another unit
     * @param {Unit} unit Target unit
     * @returns {Accuracy} Converted value
     */
    to<T extends Unit>(unit: T): this {
        if (!unit) {
            throw new Error(`${this.constructor.name} does not have a unit to convert from!`);
        }
        const value = this.value;
        if (!(value instanceof Vector3) && typeof value !== 'number') {
            throw new Error(`${this.constructor.name} can not be converted!`);
        }
        const result = this.unit.convert(value, unit);
        return new (this.constructor as new (...args: any[]) => this)(result, unit);
    }

    /**
     * Unit this value is in
     * @returns {Unit} Unit this value is in
     */
    get unit(): U {
        return this._unit;
    }

    /**
     * Get a one dimensional primitive value
     * @returns {number} Primitive value
     */
    abstract valueOf(): number;

    /**
     * Returns a string representation of an object.
     * @returns {string} Unit value as string
     */
    abstract toString(): string;

    clone(): this {
        const result = new (this.constructor as new (...args: any[]) => this)();
        result.value = this.value;
        result._unit = this._unit;
        return result;
    }
}
