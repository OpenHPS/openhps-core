import 'reflect-metadata';
import { RelativeLocation } from "./RelativeLocation";
import { AngleUnit } from '../../utils';
import { SerializableObject, SerializableMember } from '../decorators';

/**
 * Relative location to another reference object measured in the angle.
 */
@SerializableObject()
export class RelativeAngleLocation extends RelativeLocation {
    private _angle: number;
    private _angleUnit: AngleUnit;

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
