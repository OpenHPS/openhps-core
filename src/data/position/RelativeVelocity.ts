import { RelativePosition } from './RelativePosition';
import { SerializableObject } from '../decorators';
import { Velocity } from '../values/Velocity';

/**
 * Relative velocity to another reference object
 *
 * @deprecated Use [[RelativeLinearVelocity]] and/or [[RelativeAngularVelocity]] instead
 * @category Position
 */
@SerializableObject()
export class RelativeVelocity extends RelativePosition<Velocity> {
    get velocity(): Velocity {
        return this.referenceValue;
    }

    set velocity(value: Velocity) {
        this.referenceValue = value;
    }
}
