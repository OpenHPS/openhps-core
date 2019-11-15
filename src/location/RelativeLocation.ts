import { Location } from "./Location";

/**
 * # OpenHPS: Relative location
 */
export class RelativeLocation extends Location {
    private _referenceObject: Object;

    /**
     * Get the reference object that this location is relative to
     */
    public getReferenceObject() : Object {
        return this._referenceObject;
    }
}