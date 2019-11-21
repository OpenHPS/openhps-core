import { AbsoluteLocation, RelativeLocation } from "../location";
import { Shape } from "./Shape";
import { DataObjectCategory } from "./DataObjectCategory";

/**
 * # OpenHPS: Data object
 * An object is an instance that can be anything ranging from a person or asset to
 * a more abstract object such as a Wi-Fi access point or room.
 */
export class DataObject {
    protected _id: string;
    protected _displayName: string;
    protected _absoluteLocation: AbsoluteLocation;
    protected _relativeLocations: RelativeLocation[] = new Array();
    protected _shape: Shape;
    protected _connectedObjects: Object[];
    protected _category: DataObjectCategory = DataObjectCategory.DEFAULT;

    constructor(id: string = null) {
        this._id = id;
    }

    /**
     * Get the object identifier
     */
    public getId(): string {
        return this._id;
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
