import { Unit } from '../../utils';
import { SerializableObject, SerializableMember, NumberType } from '../decorators';
import { Accuracy } from './Accuracy';

@SerializableObject()
export class Accuracy1D<U extends Unit = Unit> extends Accuracy<U, number> {
    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    value: number;

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
