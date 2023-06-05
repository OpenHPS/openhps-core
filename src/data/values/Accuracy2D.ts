import { Unit } from '../../utils';
import { Vector3 } from '../../utils/math/';
import { SerializableObject } from '../decorators';
import { Accuracy } from './Accuracy';

@SerializableObject()
export class Accuracy2D<U extends Unit = Unit> extends Accuracy<U, Vector3> {
    constructor(x?: number, y?: number, unit?: U) {
        super(new Vector3(), unit);
        this.value.x = x;
        this.value.y = y;
    }

    /**
     * Convert the value to another unit
     * @param {Unit} unit Target unit
     * @returns {Accuracy2D} Converted value
     */
    to<T extends Unit>(unit: T): this {
        const accuracy = super.to(unit) as this;
        accuracy.x = this.unit.convert(this.x, unit);
        accuracy.y = this.unit.convert(this.y, unit);
        return accuracy;
    }

    valueOf(): number {
        return (this.x + this.y) / 2;
    }

    toString(): string {
        return this.valueOf().toString();
    }

    get x(): number {
        return this.value.x;
    }

    set x(val: number) {
        this.value.x = val;
    }

    get y(): number {
        return this.value.y;
    }

    set y(val: number) {
        this.value.y = val;
    }
}
