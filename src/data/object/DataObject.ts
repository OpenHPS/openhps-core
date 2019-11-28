import { AbsoluteLocation, RelativeLocation } from "../location";
import { Shape } from "../geometry";
import { DataObjectCategory } from "./DataObjectCategory";

/**
 * # OpenHPS: Data object
 * An object is an instance that can be anything ranging from a person or asset to
 * a more abstract object such as a Wi-Fi access point or room.
 */
export class DataObject {
    protected uid: string;
    protected displayName: string;
    protected absoluteLocation: AbsoluteLocation;
    protected relativeLocations: RelativeLocation[] = new Array();
    protected shape: Shape;
    protected connectedObjects: Object[];
    protected category: DataObjectCategory = DataObjectCategory.DEFAULT;
    protected raw: any;
    protected layerData: Map<string, any> = new Map();

    constructor(uid: string = null) {
        this.setUID(uid);
    }

    /**
     * Get the object identifier
     */
    public getUID(): string {
        return this.uid;
    }

    /**
     * Set the object identifier
     * @param uid Object identifier
     */
    public setUID(uid: string) {
        this.uid = uid;
    }

    /**
     * Get raw data object
     */
    public getRawData(): any {
        return this.raw;
    }

    /**
     * Set raw data object
     * @param data Raw data
     */
    public setRawData(data: any): void {
        this.raw = data;
    }

    /**
     * Get the object display name
     */
    public getDisplayName(): string {
        return this.displayName;
    }

    /**
     * Set the display name of the object
     * @param displayName Object display name
     */
    public setDisplayName(displayName: string): void {
        this.displayName = displayName;
    }

    /**
     * Get the absolute location of the object
     */
    public getAbsoluteLocation(): AbsoluteLocation {
        return this.absoluteLocation;
    }

    /**
     * Set the absolute location of the object
     * @param absoluteLocation Absolute location of the object
     */
    public setAbsoluteLocation(absoluteLocation: AbsoluteLocation): void {
        this.absoluteLocation = absoluteLocation;
    }

    /**
     * Get object shape
     */
    public getShape(): Shape {
        return this.shape;
    }

    /**
     * Set object shape
     * @param size Object shape
     */
    public setShape(shape: Shape): void {
        this.shape = shape;
    }

    /**
     * Get relative locations
     */
    public getRelativeLocations(): RelativeLocation[] {
        return this.relativeLocations;
    }

    /**
     * Get object category
     */
    public getCategory(): DataObjectCategory {
        return this.category;
    }

    /**
     * Set object category
     * @param category Data object category
     */
    public setCategory(category: DataObjectCategory): void {
        this.category = category;
    }

    /**
     * Get layer data
     * @param layerUID Layer UID 
     */
    public getLayerData(layerUID: string): any {
        return this.layerData.get(layerUID);
    }

    /**
     * Add layer data
     * @param layerUID Layer UID 
     * @param data Layer data to save
     */
    public setLayerData(layerUID: string, data: any): void {
        this.layerData.set(layerUID, data);
    }
}
