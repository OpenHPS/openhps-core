import { Position } from "./Position";
import { SerializableObject, SerializableMember } from "../decorators";
import { LengthUnit, Quaternion } from "../../utils";
import { Velocity } from "./Velocity";

/**
 * Absolute position
 */
@SerializableObject()
export abstract class AbsolutePosition extends Position {
    private _velocity: Velocity = new Velocity();
    private _orientation: Quaternion = new Quaternion();
    private _unit: LengthUnit = LengthUnit.POINTS;
    private _referenceSpaceUID: string;

    public static fromVector<P extends AbsolutePosition>(vector: number[], unit: LengthUnit, type: new () => P): P {
        const position = new type();
        position.unit = unit;
        position.fromVector(vector);
        return position;
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

    public abstract fromVector(vector: number[], unit?: LengthUnit): void;
    
    public abstract toVector(unit?: LengthUnit): number[];

    public equals(position: AbsolutePosition): boolean {
        const s = this.toVector();
        const o = position.toVector();
        
        if (s.length !== o.length) return false;

        for (let i = 0; s.length < i; i++) {
            if (s[i] !== o[i]) return false;
        }
        return true;
    }

}
