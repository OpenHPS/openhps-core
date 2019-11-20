import { Object } from "./object";

/**
 * # OpenHPS: Data frame
 */
export abstract class DataFrame {
    private _timestamp: number;
    private _objects: Object[] = Array<Object>();
    private _data: any;

    /**
     * Create a new data frame
     * @param json Optional JSON to parse from
     */
    constructor(json: any = null) {
        this.setTimestamp(Date.now());
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
     * Get data frame data
     */
    public getData(): any {
        return this._data;
    }

    /**
     * Get data frame timestamp (ISO 8601)
     */
    public getTimestamp(): number {
        return this._timestamp;
    }

    /**
     * Set data frame timestamp (ISO 8601)
     * @param timestamp 
     */
    public setTimestamp(timestamp: number): void {
        this._timestamp = timestamp;
    }

    /**
     * Get known objects used in this data frame
     */
    public getObjects(): Object[] {
        return this._objects;
    }

    /**
     * Add a new object relevant to this data frame
     * @param object Relevant object
     */
    public addObject(object: Object) {
        this._objects.push(object);
    }

    /**
     * Remove an object from the data frame
     * @param object Object to remove
     */
    public removeObject(object: Object) {
        this._objects.splice(this._objects.indexOf(object), 1);
    }
}
