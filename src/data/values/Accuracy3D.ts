import { Unit } from '../../utils';
import { SerializableObject } from '../decorators';
import { Accuracy2D } from './Accuracy2D';

@SerializableObject()
export class Accuracy3D<U extends Unit = Unit> extends Accuracy2D<U> {
    constructor(x?: number, y?: number, z?: number, unit?: U) {
        super(x, y, unit);
        this.value.z = z;
    }

    /**
     * Convert the value to another unit
     * @param {Unit} unit Target unit
     * @returns {Accuracy3D} Converted value
     */
    to<T extends Unit>(unit: T): this {
        const accuracy = super.to(unit) as this;
        accuracy.z = this.unit.convert(this.z, unit);
        return accuracy;
    }

    valueOf(): number {
        return (this.x + this.y + this.z) / 3;
    }

    get z(): number {
        return this.value.z;
    }

    set z(val: number) {
        this.value.z = val;
    }
}
