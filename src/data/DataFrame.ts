import { DataObject, DataObjectCategory } from "./object";
import * as uuidv4 from 'uuid/v4';

/**
 * Data frame that is passed through each layer in a model.
 */
export class DataFrame {
    private _uid: string = uuidv4();
    private _createdTimestamp: number;
    private _modifiedTimestamp: number;
    private _source: DataObject;
    private _categoryObjectsMap: Map<DataObjectCategory, DataObject[]> = new Map();
    private _objects: DataObject[] = new Array<DataObject>();
    private _raw: any;

    /**
     * Create a new data frame
     * @param json Optional JSON to parse from
     */
    constructor(json: any = null) {
        const timestamp = Date.now();
        this.setCreatedTimestamp(timestamp);
        this.setModifiedTimestamp(timestamp);
        this.parseJSON(json);
    }

    /**
     * Parse the JSON object or string
     * @param json JSON object or string
     */
    public parseJSON(json: any): void {
        if (json === null) {
            return;
        }
        this._raw = json;
        if (typeof json === "string") {
            this._raw = JSON.parse(json);
        }
        if (this._raw.source !== undefined) {
            this.setSource(this.parseDataObject(this._raw.source));
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
        return this._uid;
    }

    /**
     * Get the source object that captured the data frame
     */
    public getSource(): DataObject {
        return this._source;
    }

    /**
     * Set the source object that captured the data frame
     * @param source Object that captured the data frame
     */
    public setSource(source: DataObject): void {
        this._source = source;
    }

    /**
     * Set data frame created timestamp (ISO 8601)
     * @param timestamp 
     */
    public setCreatedTimestamp(timestamp: number): void {
        this._createdTimestamp = timestamp;
    }

    /**
     * Get data frame created timestamp (ISO 8601)
     */
    public getCreatedTimestamp(): number {
        return this._createdTimestamp;
    }
    
    /**
     * Set data frame modified timestamp (ISO 8601)
     * @param timestamp 
     */
    public setModifiedTimestamp(timestamp: number): void {
        this._modifiedTimestamp = timestamp;
    }

    /**
     * Get data frame modified timestamp (ISO 8601)
     */
    public getModifiedTimestamp(): number {
        return this._modifiedTimestamp;
    }

    /**
     * Update the modified timestamp
     */
    public updateModifiedTimestamp(): void {
        this._modifiedTimestamp = Date.now();
    }

    /**
     * Get known objects used in this data frame
     */
    public getObjects(category?: DataObjectCategory): DataObject[] {
        if (category) {
            return this._categoryObjectsMap.get(category);
        } else {
            return this._objects;
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
        this._objects.push(object);
    }

    /**
     * Remove an object from the data frame
     * @param object Object to remove
     */
    public removeObject(object: DataObject): void {
        this._objects.splice(this._objects.indexOf(object), 1);
        const categoryObjects = this._categoryObjectsMap.get(object.getCategory());
        categoryObjects.splice(categoryObjects.indexOf(object), 1);
    }

    /**
     * Get raw data object
     */
    public getRawData(): any {
        return this._raw;
    }
}
