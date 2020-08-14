import { AbsolutePosition } from "./AbsolutePosition";
import { SerializableMember, SerializableObject } from "../decorators";
import { LengthUnit } from "../../utils";
import { Vector3, Vector2, Quaternion } from "../../utils/math";
import { Velocity } from "./Velocity";
import { DataSerializer } from "../DataSerializer";

/**
 * Absolute cartesian 2D position. This class implements a [[Vector2]]. This location can be used both as
 * an absolute location or relative location.
 */
@SerializableObject()
export class Absolute2DPosition extends Vector2 implements AbsolutePosition {
    private _velocity: Velocity = new Velocity();
    private _orientation: Quaternion = new Quaternion();
    private _unit: LengthUnit = LengthUnit.METER;
    private _referenceSpaceUID: string;
    private _accuracy: number;
    private _timestamp: number = new Date().getTime();
    private _accuracyUnit: LengthUnit = LengthUnit.METER;

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
     * Position reference space UID
     */
    @SerializableMember()
    public get referenceSpaceUID(): string {
        return this._referenceSpaceUID;
    }

    public set referenceSpaceUID(referenceSpaceUID: string) {
        this._referenceSpaceUID = referenceSpaceUID;
    }

    /**
     * Velocity at recorded position
     */
    @SerializableMember()
    public get velocity(): Velocity {
        return this._velocity;
    }

    public set velocity(velocity: Velocity) {
        this._velocity = velocity;
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
     * Position unit
     */
    @SerializableMember()
    public get unit(): LengthUnit {
        return this._unit;
    }

    public set unit(unit: LengthUnit) {
        this._unit = unit;
    }

    /**
     * Midpoint to another location
     * @param otherPosition Other location
     */
    public midpoint(otherPosition: Absolute2DPosition, distanceSelf: number = 1, distanceOther: number = 1): Promise<Absolute2DPosition> {
        return new Promise<Absolute2DPosition>((resolve, reject) => {
            const newPoint = new Absolute2DPosition();
            newPoint.accuracy = this.accuracy + otherPosition.accuracy / 2;
            newPoint.set((this.x + otherPosition.x) / 2, (this.y + otherPosition.y) / 2);
            resolve(newPoint);
        });
    }

    public fromVector(vector: Vector2 | Vector3, unit?: LengthUnit): void {
        if (unit) {
            this.x = unit.convert(vector.x, this.unit);
            this.y = unit.convert(vector.y, this.unit);
        } else {
            this.x = vector.x;
            this.y = vector.y;
        }
    }

    public toVector3(unit?: LengthUnit): Vector3 {
        if (unit) {
            return new Vector3(
                this.unit.convert(this.x, unit), 
                this.unit.convert(this.y, unit));
        } else {
            return new Vector3(this.x, this.y);
        }
    }

    public equals(position: Absolute2DPosition): boolean {
        return this.toVector3(this.unit).equals(position.toVector3(this.unit));
    }

    /**
     * Clone the position
     */
    public clone(): this {
        const position = new Absolute2DPosition(this.x, this.y);
        position.unit = this.unit;
        position.accuracy = this.accuracy;
        position.accuracyUnit = this.accuracyUnit;
        position.orientation = this.orientation.clone();
        position.velocity = this.velocity.clone();
        position.timestamp = this.timestamp;
        position.referenceSpaceUID = this.referenceSpaceUID;
        return position as this;
    }

}
