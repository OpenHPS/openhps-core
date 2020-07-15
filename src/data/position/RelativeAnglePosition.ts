import { RelativePosition } from "./RelativePosition";
import { AngleUnit } from '../../utils';
import { SerializableObject, SerializableMember } from '../decorators';
import { DataObject } from '../object/DataObject';

/**
 * Relative location to another reference object measured in the angle.
 */
@SerializableObject()
export class RelativeAnglePosition extends RelativePosition {
    private _angle: number;
    private _angleUnit: AngleUnit;

    constructor(referenceObject?: DataObject, angle?: number, angleUnit?: AngleUnit) {
        super(referenceObject);
        this.angle = angle;
        this._angleUnit = angleUnit;
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
        this.referenceValue = angle;
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
