import { Position } from "./Position";
import { SerializableObject, SerializableMember } from '../decorators';
import { Unit } from "../../utils";
import { Velocity } from "./Velocity";
import { Orientation } from "./Orientation";

/**
 * Relative location to another reference object.
 */
@SerializableObject()
export class RelativePosition implements Position {
    private _referenceObjectUID: string;
    private _referenceObjectType: string;
    private _referenceValue: number;
    private _timestamp: number = new Date().getTime();
    private _accuracy: number;
    private _accuracyUnit: Unit;
    private _velocity: Velocity = new Velocity();
    private _orientation: Orientation;

    constructor(referenceObject?: any, referenceValue?: number) {
        if (referenceObject !== undefined) {
            if (referenceObject instanceof String || typeof referenceObject === 'string') {
                this.referenceObjectUID = referenceObject as string;
            } else {
                this.referenceObjectType = referenceObject.constructor.name;
                this.referenceObjectUID = referenceObject.uid;
            }
        }
        this.referenceValue = referenceValue;
    }

    @SerializableMember()
    public get timestamp(): number {
        return this._timestamp;
    }

    public set timestamp(timestamp: number) {
        this._timestamp = timestamp;
    }

    @SerializableMember()
    public get velocity(): Velocity {
        return this._velocity;
    }

    public set velocity(velocity: Velocity) {
        this._velocity = velocity;
    }

    @SerializableMember()
    public get orientation(): Orientation {
        return this._orientation;
    }

    public set orientation(orientation: Orientation) {
        this._orientation = orientation;
    }

    /**
     * Get location accuracy
     */
    @SerializableMember()
    public get accuracy(): number {
        return this._accuracy;
    }

    /**
     * Set location accuracy
     * @param accuracy Position accuracy
     */
    public set accuracy(accuracy: number) {
        this._accuracy = accuracy;
    }

    /**
     * Get accuracy unit
     */
    @SerializableMember()
    public get accuracyUnit(): Unit {
        return this._accuracyUnit;
    }

    public set accuracyUnit(unit: Unit) {
        this._accuracyUnit = unit;
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
    public get referenceValue(): number {
        return this._referenceValue;
    }

    public set referenceValue(value: number) {
        this._referenceValue = value;
    }

    @SerializableMember()
    public get referenceObjectType(): string {
        return this._referenceObjectType;
    }

    public set referenceObjectType(referenceObjectType: string) {
        this._referenceObjectType = referenceObjectType;
    }
}
