import { Unit } from '../../utils';
import { Vector3 } from '../../utils/math/';
import { SerializableMember, SerializableObject } from '../decorators';
import { Accuracy } from './Accuracy';
import { Accuracy2D } from './Accuracy2D';

@SerializableObject()
export class Accuracy3D<U extends Unit = Unit> extends Accuracy<U> {
    @SerializableMember()
    private _vector: Vector3 = new Vector3();

    constructor(x?: number, y?: number, z?: number, unit?: U) {
        super((x + y + z) / 2, unit);
        this._vector.x = x;
        this._vector.y = y;
        this._vector.z = z;
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
        accuracy.z = this.unit.convert(this.z, unit);
        return accuracy;
    }

    private _updateValue(): void {
        this._value = (this.x + this.y + this.z) / 2;
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

    get z(): number {
        return this._vector.z;
    }

    set z(val: number) {
        this._vector.z = val;
        this._updateValue();
    }

    clone(): this {
        const result = super.clone();
        result._vector = this._vector.clone();
        return result;
    }
}
