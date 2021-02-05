import { RelativePosition } from './RelativePosition';
import { SerializableObject, SerializableMember } from '../decorators';
import { DataSerializer } from '../DataSerializer';

/**
 * Relative value to another reference object.
 *
 * @category Position
 */
@SerializableObject()
export class RelativeValue implements RelativePosition<number> {
    /**
     * Position recording timestamp
     */
    @SerializableMember()
    public timestamp: number = Date.now();
    /**
     * Reference object UID that this location is relative to
     */
    @SerializableMember()
    public referenceObjectUID: string;
    @SerializableMember()
    public referenceObjectType: string;
    @SerializableMember()
    public referenceValue: number;

    constructor(referenceObject?: string, value?: number) {
        this.referenceObjectUID = referenceObject;
        this.referenceValue = value;
    }

    public equals(position: this): boolean {
        return this.timestamp === position.timestamp;
    }

    /**
     * Clone the position
     *
     * @returns {RelativeValue} Cloned relative value
     */
    public clone(): this {
        const serialized = DataSerializer.serialize(this);
        const clone = DataSerializer.deserialize(serialized) as this;
        return clone;
    }
}
