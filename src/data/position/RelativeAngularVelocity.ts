import { RelativePosition } from './RelativePosition';
import { SerializableObject, SerializableMember } from '../decorators';
import { AngularVelocity } from '../values';
import { AngularVelocityUnit } from '../../utils';

/**
 * Relative angular velocity to another reference object
 * @category Position
 */
@SerializableObject()
export class RelativeAngularVelocity extends RelativePosition<AngularVelocity, AngularVelocityUnit> {
    @SerializableMember()
    referenceValue: AngularVelocity;

    constructor(referenceObject?: any, velocity?: AngularVelocity) {
        super(referenceObject, velocity, AngularVelocityUnit.RADIAN_PER_MINUTE);
    }

    get velocity(): AngularVelocity {
        return this.referenceValue;
    }

    set velocity(value: AngularVelocity) {
        this.referenceValue = value;
    }
}
