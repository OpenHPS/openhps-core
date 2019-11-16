import { Object } from "./object";

/**
 * # OpenHPS: Data frame
 */
export abstract class DataFrame {
    private _timestamp: number;
    private _objects: Object[] = Array<Object>();

    constructor() {
        this.setTimestamp(Date.now());
    }

    /**
     * Get data frame timestamp (ISO 8601)
     */
    public getTimestamp() : number {
        return this._timestamp;
    }

    /**
     * Set data frame timestamp (ISO 8601)
     * @param timestamp 
     */
    public setTimestamp(timestamp: number) : void {
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
}