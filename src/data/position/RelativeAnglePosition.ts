import { RelativePosition } from './RelativePosition';
import { AngleUnit, Quaternion } from '../../utils';
import { SerializableObject, SerializableMember } from '../decorators';
import { DataSerializer } from '../DataSerializer';

/**
 * Relative location to another reference object measured in the angle.
 */
@SerializableObject()
export class RelativeAnglePosition implements RelativePosition<number> {
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
    /**
     * Position accuracy
     */
    @SerializableMember()
    public accuracy: number;
    /**
     * Orientation at recorded position
     */
    @SerializableMember()
    public orientation: Quaternion = new Quaternion();
    /**
     * Angle to reference object
     */
    @SerializableMember()
    public angle: number;
    /**
     * Angle unit
     */
    @SerializableMember()
    public angleUnit: AngleUnit;

    constructor(referenceObject?: any, angle?: number, angleUnit?: AngleUnit, orientation?: Quaternion) {
        if (referenceObject !== undefined) {
            if (referenceObject instanceof String || typeof referenceObject === 'string') {
                this.referenceObjectUID = referenceObject as string;
            } else {
                this.referenceObjectType = referenceObject.constructor.name;
                this.referenceObjectUID = referenceObject.uid;
            }
        }
        this.angle = angle;
        this.angleUnit = angleUnit;
        if (orientation) {
            this.orientation = orientation;
        }
    }

    public get referenceValue(): number {
        return this.angle;
    }

    public set referenceValue(value: number) {
        this.angle = value;
    }

    public equals(position: this): boolean {
        return this.timestamp === position.timestamp;
    }

    /**
     * Clone the position
     *
     * @returns {RelativeAnglePosition} Cloned relative angle
     */
    public clone(): this {
        const serialized = DataSerializer.serialize(this);
        const clone = DataSerializer.deserialize(serialized) as this;
        return clone;
    }
}
