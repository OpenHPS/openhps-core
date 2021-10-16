import { Unit } from '../../utils';
import { SerializableObject } from '../decorators';
import { Accuracy2D } from './Accuracy2D';

@SerializableObject()
export class Accuracy3D<U extends Unit = Unit> extends Accuracy2D<U> {

    constructor(x?: number, y?: number, z?: number, unit?: U) {
        super(x, y, unit);
        this.valueOf().z = z;
    }

    get z(): number {
        return this._value.z;
    }

    set z(val: number) {
        this._value.z = val;
    }
    
}
