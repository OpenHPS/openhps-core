import { RelativeLocation } from "./RelativeLocation";

export class RelativeDistanceLocation extends RelativeLocation {
    protected _distance: number;

    /**
     * Get distance to relative object
     */
    public getDistance() : number {
        return this._distance;
    }

    /**
     * Set distance to relative object
     * @param distance Distance to relative object
     */
    public setDistance(distance: number) : void {
        this._distance = distance;
    }
}