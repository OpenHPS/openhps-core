import { RelativePosition } from './RelativePosition';
import { SerializableObject } from '../decorators';
import { AngularVelocity } from '../values';
import { AngularVelocityUnit } from '../../utils';

/**
 * Relative angular velocity to another reference object
 *
 * @category Position
 */
@SerializableObject()
export class RelativeAngularVelocity extends RelativePosition<AngularVelocity, AngularVelocityUnit> {
    get velocity(): AngularVelocity {
        return this.referenceValue;
    }

    set velocity(value: AngularVelocity) {
        this.referenceValue = value;
    }
}
