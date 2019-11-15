import { Object } from "../Object";

/**
 * # OpenHPS: Data Frame
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
     * Get known tracked object
     */
    public getTrackedIndividuals(): Object[] {
        return this._objects;
    }

    /**
     * Add a new tracked object
     * @param object 
     */
    public addTrackedIndividual(object: Object) {
        this._objects.push(object);
    }
}