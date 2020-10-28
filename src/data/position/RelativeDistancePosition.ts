import { RelativePosition } from './RelativePosition';
import { LengthUnit } from '../../utils';
import { SerializableObject, SerializableMember } from '../decorators';
import { DataSerializer } from '../DataSerializer';

/**
 * Relative location to another reference object in distance.
 */
@SerializableObject()
export class RelativeDistancePosition implements RelativePosition {
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
    @SerializableMember()
    public accuracyUnit: LengthUnit = LengthUnit.METER;
    private _distance: number;
    /**
     * Distance unit
     */
    @SerializableMember()
    public distanceUnit: LengthUnit;

    constructor(referenceObject?: any, distance?: number, distanceUnit?: LengthUnit) {
        if (referenceObject !== undefined) {
            if (referenceObject instanceof String || typeof referenceObject === 'string') {
                this.referenceObjectUID = referenceObject as string;
            } else {
                this.referenceObjectType = referenceObject.constructor.name;
                this.referenceObjectUID = referenceObject.uid;
            }
        }
        this.distance = distance;
        this.distanceUnit = distanceUnit;
    }

    /**
     * Distance to reference object
     *
     * @returns {number} Distance
     */
    @SerializableMember()
    public get distance(): number {
        return this._distance;
    }

    public set distance(value: number) {
        this._distance = value;
    }

    public get referenceValue(): number {
        return this.distance;
    }

    public set referenceValue(value: number) {
        this.distance = value;
    }

    public equals(position: this): boolean {
        return this.timestamp === position.timestamp;
    }

    /**
     * Clone the position
     *
     * @returns {RelativeDistancePosition} Cloned relative distance
     */
    public clone(): this {
        const serialized = DataSerializer.serialize(this);
        const clone = DataSerializer.deserialize(serialized) as this;
        return clone;
    }
}
