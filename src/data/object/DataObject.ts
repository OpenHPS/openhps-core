import { AbsoluteLocation, RelativeLocation } from "../location";
import { Shape } from "../geometry";
import { DataObjectCategory } from "./DataObjectCategory";

/**
 * # OpenHPS: Data object
 * An object is an instance that can be anything ranging from a person or asset to
 * a more abstract object such as a Wi-Fi access point or room.
 */
export class DataObject {
    protected _uid: string;
    protected _displayName: string;
    protected _absoluteLocation: AbsoluteLocation;
    protected _relativeLocations: RelativeLocation[] = new Array();
    protected _shape: Shape;
    protected _connectedObjects: Object[];
    protected _category: DataObjectCategory = DataObjectCategory.DEFAULT;
    protected _raw: any;

    constructor(uid: string = null) {
        this.setUID(uid);
    }

    /**
     * Get the object identifier
     */
    public getUID(): string {
        return this._uid;
    }

    /**
     * Set the object identifier
     * @param uid Object identifier
     */
    public setUID(uid: string) {
        this._uid = uid;
    }

    /**
     * Get raw data object
     */
    public getRawData(): any {
        return this._raw;
    }

    /**
     * Set raw data object
     * @param data Raw data
     */
    public setRawData(data: any): void {
        this._raw = data;
    }

    /**
     * Get the object display name
     */
    public getDisplayName(): string {
        return this._displayName;
    }

    /**
     * Set the display name of the object
     * @param displayName Object display name
     */
    public setDisplayName(displayName: string): void {
        this._displayName = displayName;
    }

    /**
     * Get the absolute location of the object
     */
    public getAbsoluteLocation(): AbsoluteLocation {
        return this._absoluteLocation;
    }

    /**
     * Set the absolute location of the object
     * @param absoluteLocation Absolute location of the object
     */
    public setAbsoluteLocation(absoluteLocation: AbsoluteLocation): void {
        this._absoluteLocation = absoluteLocation;
    }

    /**
     * Get object shape
     */
    public getShape(): Shape {
        return this._shape;
    }

    /**
     * Set object shape
     * @param size Object shape
     */
    public setShape(shape: Shape): void {
        this._shape = shape;
    }

    /**
     * Get relative locations
     */
    public getRelativeLocations(): RelativeLocation[] {
        return this._relativeLocations;
    }

    /**
     * Get object category
     */
    public getCategory(): DataObjectCategory {
        return this._category;
    }

    /**
     * Set object category
     * @param category Data object category
     */
    public setCategory(category: DataObjectCategory): void {
        this._category = category;
    }
}
