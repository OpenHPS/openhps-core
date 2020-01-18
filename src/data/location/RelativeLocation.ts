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

}
