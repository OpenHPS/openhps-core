import { Location } from "./Location";

/**
 * # OpenHPS: Absolute location
 */
export class AbsoluteLocation extends Location {
    private _lat: number;
    private _lng: number;
    private _mamsl: number;

    /**
     * Get latitude
     */
    public getLatitude() : number {
        return this._lat;
    }

    /**
     * Set latitude
     * @param lat 
     */
    public setLatitude(lat: number) : void {
        this._lat = lat;
    }

    /**
     * Get longitude
     */
    public getLongitude() : number {
        return this._lng;
    }

    /**
     * Set longitude
     * @param lng 
     */
    public setLongitude(lng: number) : void {
        this._lng = lng;
    }

    /**
     * Get the altitude in meters above mean sea level
     */
    public getAltitude() : number {
        return this._mamsl;
    }

    /**
     * Set the altitude
     * @param mamsl Meters above mean sea level
     */
    public setAltitude(mamsl: number) : void {
        this._mamsl = mamsl;
    }

    /**
     * Convert the point to an ECR point (Earth Centered Rotational)
     */
    public toECR() : number[] {
        let point: number[] = new Array<number>();

        return point;
    }

    /**
     * Convert the ECR point to an absolute location
     * @param ecr Earth Centered Rotational
     */
    public static fromECR(ecr: number[]) : AbsoluteLocation {
        return null;
    }
}