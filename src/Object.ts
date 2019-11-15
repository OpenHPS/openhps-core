import { Location, AbsoluteLocation, RelativeLocation } from "./location";

/**
 * # OpenHPS: Object
 */
export class Object {
    private _id: string;
    private _displayName: string;
    private _absoluteLocation: AbsoluteLocation;
    private _relativeLocations: RelativeLocation[] = new Array();

    constructor(id: string){
        this._id = id;
    }

    /**
     * Get the object identifier
     */
    public getId() : string {
        return this._id;
    }

    /**
     * Get the object display name
     */
    public getDisplayName() : string {
        return this._displayName;
    }

    /**
     * Set the display name of the object
     * @param displayName Object display name
     */
    public setDisplayName(displayName: string) : void {
        this._displayName = displayName;
    }

    /**
     * Get the absolute location of the object
     */
    public getAbsoluteLocation() : AbsoluteLocation {
        return this._absoluteLocation;
    }

    /**
     * Set the absolute location of the object
     * @param absoluteLocation Absolute location of the object
     */
    public setAbsoluteLocation(absoluteLocation: AbsoluteLocation) : void {
        this._absoluteLocation = absoluteLocation;
    }

}