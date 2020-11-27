import { RelativePosition } from './RelativePosition';
import { SerializableObject, SerializableMember } from '../decorators';
import { Velocity } from './Velocity';
import { LengthUnit } from '../../utils';
import { DataSerializer } from '../DataSerializer';
import { TimeService } from '../../service';

/**
 * Relative velocity to another reference object
 */
@SerializableObject()
export class RelativeVelocity implements RelativePosition<Velocity> {
    /**
     * Position recording timestamp
     */
    @SerializableMember()
    public timestamp: number = TimeService.now();
    /**
     * Reference object UID that this location is relative to
     */
    @SerializableMember()
    public referenceObjectUID: string;
    @SerializableMember()
    public referenceObjectType: string;
    /**
     * Position accuracy
     */
    @SerializableMember()
    public accuracy: number;
    @SerializableMember()
    public accuracyUnit: LengthUnit = LengthUnit.METER;
    @SerializableMember()
    public velocity: Velocity;

    constructor(referenceObject?: any, velocity?: Velocity) {
        if (referenceObject !== undefined) {
            if (referenceObject instanceof String || typeof referenceObject === 'string') {
                this.referenceObjectUID = referenceObject as string;
            } else {
                this.referenceObjectType = referenceObject.constructor.name;
                this.referenceObjectUID = referenceObject.uid;
            }
        }
        this.velocity = velocity;
    }

    public get referenceValue(): Velocity {
        return this.velocity;
    }

    public set referenceValue(value: Velocity) {
        this.velocity = value;
    }

    public equals(position: this): boolean {
        return this.timestamp === position.timestamp;
    }

    /**
     * Clone the position
     *
     * @returns {RelativeVelocity} Cloned relative velocity
     */
    public clone(): this {
        const serialized = DataSerializer.serialize(this);
        const clone = DataSerializer.deserialize(serialized) as this;
        return clone;
    }
}
