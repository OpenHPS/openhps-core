import { RelativePosition } from './RelativePosition';
import { SerializableObject, SerializableMember } from '../decorators';
import { Velocity } from './Velocity';

/**
 * Relative velocity to another reference object
 *
 * @category Position
 */
@SerializableObject()
export class RelativeVelocity extends RelativePosition<Velocity> {
    /**
     * Position accuracy
     */
    @SerializableMember()
    public accuracy: number;

    @SerializableMember()
    public get velocity(): Velocity {
        return this.referenceValue;
    }

    public set velocity(value: Velocity) {
        this.referenceValue = value;
    }
}
