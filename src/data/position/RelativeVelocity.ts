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
    private _velocity: Velocity;

    private _timestamp: number = new Date().getTime();
    private _referenceObjectUID: string;
    private _referenceObjectType: string;
    private _accuracy: number;
    private _accuracyUnit: LengthUnit = LengthUnit.METER;

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

    public get velocity(): Velocity {
        return this._velocity;
    }

    public set velocity(value: Velocity) {
        this._velocity = value;
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
