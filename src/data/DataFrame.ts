import { DataObject, DataObjectCategory } from "./object";
import * as uuidv4 from 'uuid/v4';

/**
 * Data frame that is passed through each layer in a model.
 */
export class DataFrame {
    protected uid: string = uuidv4();
    protected createdTimestamp: number;
    protected modifiedTimestamp: number;
    protected source: DataObject;
    protected objects: DataObject[] = new Array<DataObject>();
    protected raw: any;

    private _categoryObjectsMap: Map<DataObjectCategory, DataObject[]> = new Map();

    /**
     * Create a new data frame based on another
     * @param dataFrame Optional data frame to copy from
     */
    constructor(dataFrame?: DataFrame)
    /**
     * Create a new data frame
     * @param data Optional JSON to parse from
     */
    constructor(data?: any) {
        const timestamp = Date.now();
        this.setCreatedTimestamp(timestamp);
        this.setModifiedTimestamp(timestamp);
        if (data instanceof DataFrame) {
            // Copy contents of data frame
            this.uid = data.getUID();
            this.createdTimestamp = data.getCreatedTimestamp();
            this.modifiedTimestamp = data.getModifiedTimestamp();
            this.source = data.getSource();
            this.objects = data.getObjects();
            this.raw = data.getRawData();
        } else {
            // Parse data
            this.parseJSON(data);
        }
    }

    /**
     * Parse the JSON object or string
     * @param json JSON object or string
     */
    public parseJSON(json: any): void {
        if (json === null) {
            return;
        }
        this.raw = json;
        if (typeof json === "string") {
            this.raw = JSON.parse(json);
        }
        if (this.raw.source !== undefined) {
            this.setSource(this.parseDataObject(this.raw.source));
        }
        if (this.raw.objects !== undefined) {
            this.raw.objects.forEach((rawObject: any) => {
                this.addObject(this.parseDataObject(rawObject));
            });
        }
    }

    public parseDataObject(object: any): DataObject {
        if (typeof object === "string") {
            return new DataObject(object);
        }
        const dataObject = new DataObject();
        const objectKeys = Object.keys(object);
        dataObject.setRawData(object);
        return dataObject;
    }

    /**
     * Get the data frame unique identifier
     */
    public getUID(): string {
        return this.uid;
    }

    /**
     * Get the source object that captured the data frame
     */
    public getSource(): DataObject {
        return this.source;
    }

    /**
     * Set the source object that captured the data frame
     * @param source Object that captured the data frame
     */
    public setSource(source: DataObject): void {
        this.source = source;
    }

    /**
     * Set data frame created timestamp (ISO 8601)
     * @param timestamp 
     */
    public setCreatedTimestamp(timestamp: number): void {
        this.createdTimestamp = timestamp;
    }

    /**
     * Get data frame created timestamp (ISO 8601)
     */
    public getCreatedTimestamp(): number {
        return this.createdTimestamp;
    }
    
    /**
     * Set data frame modified timestamp (ISO 8601)
     * @param timestamp 
     */
    public setModifiedTimestamp(timestamp: number): void {
        this.modifiedTimestamp = timestamp;
    }

    /**
     * Get data frame modified timestamp (ISO 8601)
     */
    public getModifiedTimestamp(): number {
        return this.modifiedTimestamp;
    }

    /**
     * Update the modified timestamp
     */
    public updateModifiedTimestamp(): void {
        this.modifiedTimestamp = Date.now();
    }

    /**
     * Get known objects used in this data frame
     */
    public getObjects(category?: DataObjectCategory): DataObject[] {
        if (category) {
            return this._categoryObjectsMap.get(category);
        } else {
            return this.objects;
        }
    }

    /**
     * Add a new object relevant to this data frame
     * @param object Relevant object
     */
    public addObject(object: DataObject): void {
        if (this._categoryObjectsMap.has(object.getCategory())) {
            const categoryObjects = this._categoryObjectsMap.get(object.getCategory());
            categoryObjects.push(object);
        } else {
            const categoryObjects = new Array<DataObject>();
            categoryObjects.push(object);
            this._categoryObjectsMap.set(object.getCategory(), categoryObjects);
        }
        this.objects.push(object);
    }

    /**
     * Remove an object from the data frame
     * @param object Object to remove
     */
    public removeObject(object: DataObject): void {
        this.objects.splice(this.objects.indexOf(object), 1);
        const categoryObjects = this._categoryObjectsMap.get(object.getCategory());
        categoryObjects.splice(categoryObjects.indexOf(object), 1);
    }

    /**
     * Get raw data object
     */
    public getRawData(): any {
        return this.raw;
    }
}
