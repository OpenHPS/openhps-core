import 'reflect-metadata';
import { Location } from "./Location";
import { jsonObject, jsonMember } from "typedjson";

/**
 * Relative location to another reference object.
 */
@jsonObject
export class RelativeLocation implements Location {
    private _referenceObject: string;

    /**
     * Get the reference object that this location is relative to
     */
    @jsonMember
    public get referenceObject(): string {
        return this._referenceObject;
    }

    public set referenceObject(referenceObject: string) {
        this._referenceObject = referenceObject;
    }

}
