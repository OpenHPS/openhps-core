import 'reflect-metadata';
import { jsonObject, jsonMember } from "typedjson";
import { RelativeLocation } from "./RelativeLocation";
import { AngleUnit } from '../../utils';

/**
 * Relevant location to another reference object measured in the angle.
 */
@jsonObject
export class RelevantAngleLocation extends RelativeLocation {
    private _angle: number;
    private _angleUnit: AngleUnit;

    /**
     * Get angle to reference object
     */
    @jsonMember
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
    @jsonMember
    public get angleUnit(): AngleUnit {
        return this._angleUnit;
    }

    public set angleUnit(angleUnit: AngleUnit) {
        this._angleUnit = angleUnit;
    }

}
