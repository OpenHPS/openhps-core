import 'reflect-metadata';
import { Location } from "./Location";
import { LengthUnit } from "../../utils/unit/LengthUnit";
import { jsonObject, jsonMember } from "typedjson";

/**
 * Relative location to another reference object.
 */
@jsonObject
export class RelativeLocation implements Location {
    private _referenceObject: Object;
    private _distance: number;
    private _distanceUnit: LengthUnit;

    /**
     * Get the reference object that this location is relative to
     */
    @jsonMember
    public get referenceObject(): Object {
        return this._referenceObject;
    }

    public set referenceObject(referenceObject: Object) {
        this._referenceObject = referenceObject;
    }

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
