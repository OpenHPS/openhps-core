import { AbsoluteLocation, RelativeLocation } from "../../location";

/**
 * # OpenHPS: Object
 * An object is an instance that can be anything ranging from a person or asset to
 * a more abstract object such as a Wi-Fi access point or room.
 */
export class Object {
    private _id: string;
    private _displayName: string;
    private _absoluteLocation: AbsoluteLocation;
    private _relativeLocations: RelativeLocation[] = new Array();
    private _size: number = 1;

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

    /**
     * Get object size
     */
    public getSize() : number {
        return this._size;
    }

    /**
     * Set object size
     * @param size Object size
     */
    public setSize(size: number) : void {
        this._size = size;
    }

    /**
     * Get relative locations
     */
    public getRelativeLocations() : RelativeLocation[] {
        return this._relativeLocations;
    }
}