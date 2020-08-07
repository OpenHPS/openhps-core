import { RelativePosition } from "./RelativePosition";
import { AngleUnit, Quaternion, LengthUnit } from '../../utils';
import { SerializableObject, SerializableMember } from '../decorators';
import { DataSerializer } from "../DataSerializer";

/**
 * Relative location to another reference object measured in the angle.
 */
@SerializableObject()
export class RelativeAnglePosition implements RelativePosition {
    private _timestamp: number = new Date().getTime();
    private _orientation: Quaternion = new Quaternion();
    private _angle: number;
    private _angleUnit: AngleUnit;
    private _referenceObjectUID: string;
    private _referenceObjectType: string;
    private _accuracy: number;
    private _accuracyUnit: LengthUnit = LengthUnit.POINTS;

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
        this._angleUnit = angleUnit;
        if (orientation) {
            this.orientation = orientation;
        }
    }

    /**
     * Position accuracy
     */
    @SerializableMember()
    public get accuracy(): number {
        return this._accuracy;
    }

    public set accuracy(accuracy: number) {
        this._accuracy = accuracy;
    }
    
    @SerializableMember()
    public get accuracyUnit(): LengthUnit {
        return this._accuracyUnit;
    }

    public set accuracyUnit(accuracyUnit: LengthUnit) {
        this._accuracyUnit = accuracyUnit;
    }

    /**
     * Get the reference object UID that this location is relative to
     */
    @SerializableMember()
    public get referenceObjectUID(): string {
        return this._referenceObjectUID;
    }

    public set referenceObjectUID(referenceObjectUID: string) {
        this._referenceObjectUID = referenceObjectUID;
    }

    @SerializableMember()
    public get referenceObjectType(): string {
        return this._referenceObjectType;
    }

    public set referenceObjectType(referenceObjectType: string) {
        this._referenceObjectType = referenceObjectType;
    }

    /**
     * Position recording timestamp
     */
    @SerializableMember()
    public get timestamp(): number {
        return this._timestamp;
    }

    public set timestamp(timestamp: number) {
        this._timestamp = timestamp;
    }

    /**
     * Orientation at recorded position
     */
    @SerializableMember()
    public get orientation(): Quaternion {
        return this._orientation;
    }

    public set orientation(orientation: Quaternion) {
        this._orientation = orientation;
    }
    
    /**
     * Get angle to reference object
     */
    @SerializableMember()
    public get angle(): number {
        return this._angle;
    }

    /**
     * Set angle to reference object
     * @param angle Angle to reference object
     */
    public set angle(angle: number) {
        this._angle = angle;
    }

    /**
     * Get angle unit
     */
    @SerializableMember()
    public get angleUnit(): AngleUnit {
        return this._angleUnit;
    }

    public set angleUnit(angleUnit: AngleUnit) {
        this._angleUnit = angleUnit;
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
