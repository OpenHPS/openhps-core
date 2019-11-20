import { DataObject } from "./object";

/**
 * # OpenHPS: Data frame
 */
export class DataFrame {
    private _captureTimestamp: number;
    private _createdTimestamp: number;
    private _modifiedTimestamp: number;
    private _captureObject: Object;
    private _objects: DataObject[] = Array<DataObject>();
    private _data: any;

    /**
     * Create a new data frame
     * @param json Optional JSON to parse from
     */
    constructor(json: any = null) {
        const timestamp = Date.now();
        this.setCaptureTimestamp(timestamp);
        this.setCreatedTimestamp(timestamp);
        this.setModifiedTimestamp(timestamp);
        this.parseJSON(json);
    }

    public parseJSON(json: any) {
        let data = json;
        if (typeof json === "string") {
            data = JSON.parse(json);
        }
        this._data = data;
        if (this.getData().object !== undefined) {
            
        } 
    }

    /**
     * Get the object that captured the data frame
     */
    public getCaptureObject(): Object {
        return this._captureObject;
    }

    /**
     * Set the object that captured the data frame
     * @param captureObject Object that captured the data frame
     */
    public setCaptureObject(captureObject: Object): void {
        this._captureObject = captureObject;
    }

    /**
     * Get data frame data
     */
    public getData(): any {
        return this._data;
    }

    /**
     * Get data frame capture timestamp (ISO 8601)
     */
    public getCaptureTimestamp(): number {
        return this._captureTimestamp;
    }

    /**
     * Set data frame capture timestamp (ISO 8601)
     * @param timestamp 
     */
    public setCaptureTimestamp(timestamp: number): void {
        this._captureTimestamp = timestamp;
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
     * Get known objects used in this data frame
     */
    public getObjects(): DataObject[] {
        return this._objects;
    }

    /**
     * Add a new object relevant to this data frame
     * @param object Relevant object
     */
    public addObject(object: DataObject) {
        this._objects.push(object);
    }

    /**
     * Remove an object from the data frame
     * @param object Object to remove
     */
    public removeObject(object: DataObject) {
        this._objects.splice(this._objects.indexOf(object), 1);
    }
}
