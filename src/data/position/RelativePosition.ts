import { TimeService } from '../../service/TimeService';
import { DataSerializer } from '../DataSerializer';
import { SerializableMember, SerializableObject } from '../decorators';
import { Position } from './Position';

/**
 * Relative position to another reference object or space.
 *
 * @category Position
 */
@SerializableObject()
export abstract class RelativePosition<T = number> implements Position {
    /**
     * Position recording timestamp
     */
    @SerializableMember({
        index: true,
    })
    public timestamp: number = TimeService.now();
    /**
     * Reference object UID that this location is relative to
     */
    @SerializableMember()
    public referenceObjectUID: string;
    @SerializableMember()
    public referenceObjectType: string;
    public referenceValue: T;

    constructor(referenceObject?: any, value?: T) {
        if (referenceObject !== undefined) {
            if (referenceObject instanceof String || typeof referenceObject === 'string') {
                this.referenceObjectUID = referenceObject as string;
            } else {
                this.referenceObjectType = referenceObject.constructor.name;
                this.referenceObjectUID = referenceObject.uid;
            }
        }
        this.referenceValue = value;
    }

    public equals(position: this): boolean {
        return this.timestamp === position.timestamp;
    }

    /**
     * Clone the position
     *
     * @returns {RelativePosition} Cloned relative position
     */
    public clone(): this {
        const serialized = DataSerializer.serialize(this);
        const clone = DataSerializer.deserialize(serialized) as this;
        return clone;
    }
}
