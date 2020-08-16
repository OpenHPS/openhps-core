import { RelativePosition } from "./RelativePosition";
import { SerializableObject, SerializableMember } from '../decorators';
import { Velocity } from "./Velocity";
import { LengthUnit } from "../../utils";
import { DataSerializer } from "../DataSerializer";

/**
 * Relative velocity to another reference object
 */
@SerializableObject()
export class RelativeVelocity implements RelativePosition {
    /**
     * Position recording timestamp
     */
    @SerializableMember()
    public timestamp: number = new Date().getTime();
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

    public equals(position: this): boolean {
        return false;
    }

    /**
     * Clone the position
     */
    public clone(): this {
        const serialized = DataSerializer.serialize(this);
        const clone = DataSerializer.deserialize(serialized) as this;
        return clone;
    }

}
