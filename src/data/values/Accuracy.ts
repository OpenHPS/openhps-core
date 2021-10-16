import { Unit, UnitValue } from '../../utils';
import { Vector3 } from '../../utils/math/';
import { SerializableObject } from '../decorators';

@SerializableObject()
export class Accuracy<U extends Unit = Unit, T extends number | Vector3 = any> extends UnitValue<U, T> {
    
}
