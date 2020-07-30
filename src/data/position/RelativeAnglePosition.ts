import { RelativePosition } from "./RelativePosition";
import { AngleUnit, Quaternion } from '../../utils';
import { SerializableObject, SerializableMember } from '../decorators';
import { or } from "mathjs";

/**
 * Relative location to another reference object measured in the angle.
 */
@SerializableObject()
export class RelativeAnglePosition extends RelativePosition {
    private _orientation: Quaternion = new Quaternion();
    private _angle: number;
    private _angleUnit: AngleUnit;

    constructor(referenceObject?: any, angle?: number, angleUnit?: AngleUnit, orientation?: Quaternion) {
        super(referenceObject);
        this.angle = angle;
        this._angleUnit = angleUnit;
        if (orientation) {
            this.orientation = orientation;
        }
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
     * Get accuracy unit
     */
    @SerializableMember()
    public get accuracyUnit(): AngleUnit {
        return super.accuracyUnit;
    }

    public set accuracyUnit(unit: AngleUnit) {
        super.accuracyUnit = unit;
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

}
