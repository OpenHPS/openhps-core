import { RelativePosition } from './RelativePosition';
import { SerializableObject } from '../decorators';
import { LinearVelocity } from '../values';
import { LinearVelocityUnit } from '../../utils';

/**
 * Relative linear velocity to another reference object
 *
 * @category Position
 */
@SerializableObject()
export class RelativeLinearVelocity extends RelativePosition<LinearVelocity, LinearVelocityUnit> {
    constructor(referenceObject?: any, velocity?: LinearVelocity) {
        super(referenceObject, velocity, LinearVelocityUnit.METER_PER_SECOND);
    }

    get velocity(): LinearVelocity {
        return this.referenceValue;
    }

    set velocity(value: LinearVelocity) {
        this.referenceValue = value;
    }
}
