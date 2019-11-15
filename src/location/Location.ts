/**
 * # OpenHPS: Location
 */
export abstract class Location {
    private _accuracy: number;

    /**
     * Get location accuracy
     */
    public getAccuracy() : number {
        return this._accuracy;
    }

    /**
     * Set location accuracy
     * @param accuracy Location accuracy
     */
    public setAccuracy(accuracy: number) : void {
        this._accuracy = accuracy;
    }
}