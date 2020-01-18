import 'reflect-metadata';
import { jsonObject, jsonMember } from "typedjson";
import { RelativeLocation } from "./RelativeLocation";
import { LengthUnit } from "../../utils";

/**
 * Relevant location to another reference object in distance.
 */
@jsonObject
export class RelevantDistanceLocation extends RelativeLocation {
    private _distance: number;
    private _distanceUnit: LengthUnit;

    /**
     * Get distance to reference object
     */
    @jsonMember
    public get distance(): number {
        return this._distance;
    }

    /**
     * Set distance to reference object
     * @param distance Distance to reference object
     */
    public set distance(distance: number) {
        this._distance = distance;
    }

    /**
     * Get distance unit
     */
    @jsonMember
    public get distanceUnit(): LengthUnit {
        return this._distanceUnit;
    }

    public set distanceUnit(distanceUnit: LengthUnit) {
        this._distanceUnit = distanceUnit;
    }

}
