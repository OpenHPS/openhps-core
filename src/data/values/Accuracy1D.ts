import { Unit } from '../../utils';
import { SerializableObject } from '../decorators';
import { Accuracy } from './Accuracy';

@SerializableObject()
export class Accuracy1D<U extends Unit = Unit> extends Accuracy<U, number> {
    constructor(value?: number, unit?: U) {
        super(value, unit);
    }

    valueOf(): number {
        return this.value.valueOf();
    }

    toString(): string {
        return this.valueOf().toString();
    }
}
