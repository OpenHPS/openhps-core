import { AbsoluteLocation } from "./AbsoluteLocation";

/**
 * # OpenHPS: Geographical location
 */
export class GeographicalLocation extends AbsoluteLocation {
    protected _lat: number;
    protected _lng: number;
    protected _mamsl: number;

    protected static EARTH_RADIUS: number = 6371008; 

    /**
     * Get latitude
     */
    public getLatitude(): number {
        return this._lat;
    }

    /**
     * Set latitude
     * @param lat 
     */
    public setLatitude(lat: number): void {
        this._lat = lat;
    }

    /**
     * Get longitude
     */
    public getLongitude(): number {
        return this._lng;
    }

    /**
     * Set longitude
     * @param lng 
     */
    public setLongitude(lng: number): void {
        this._lng = lng;
    }

    /**
     * Get the altitude in meters above mean sea level
     */
    public getAltitude(): number {
        return this._mamsl;
    }

    /**
     * Set the altitude
     * @param mamsl Meters above mean sea level
     */
    public setAltitude(mamsl: number): void {
        this._mamsl = mamsl;
    }

    /**
     * Get the distance from this location to a destination
     * @param destination Destination location
     */
    public distance(destination: GeographicalLocation): number {
        const latRadA = this.toRadians(this.getLatitude());
        const latRadB = this.toRadians(destination.getLatitude());
        const Δlat = this.toRadians(destination.getLatitude() - this.getLatitude());
        const Δlon = this.toRadians(destination.getLongitude() - this.getLongitude());
        const a = Math.sin(Δlat / 2) * Math.sin(Δlat / 2) +
                Math.cos(latRadA) * Math.cos(latRadB) *
                Math.sin(Δlon / 2) * Math.sin(Δlon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return GeographicalLocation.EARTH_RADIUS * c;
    }


    /**
     * Get the bearing in degrees from this location to a destination
     * @param destination Destination location
     */
    public bearing(destination: GeographicalLocation): number {
        const lonRadA = this.toRadians(this.getLongitude());
        const latRadA = this.toRadians(this.getLatitude());
        const lonRadB = this.toRadians(destination.getLongitude());
        const latRadB = this.toRadians(destination.getLatitude());
        const y = Math.sin(lonRadB - lonRadA) * Math.cos(latRadB);
        const x = Math.cos(latRadA) * Math.sin(latRadB) -  Math.sin(latRadA) * Math.cos(latRadB) * Math.cos(lonRadB - lonRadA);
        return this.toDegrees(Math.atan2(y, x));
    }

    public getMidpointLocation(otherLocation: AbsoluteLocation): Promise<AbsoluteLocation> {
        return new Promise<AbsoluteLocation>((resolve, reject) => {
       
        });
    }

    /**
     * Convert the point to an ECR point (Earth Centered Rotational)
     */
    public toECR(): number[] {
        const point: number[] = new Array<number>();
        point[0] = 1;
        return point;
    }

    /**
     * Convert the ECR point to an absolute location
     * @param ecr Earth Centered Rotational
     */
    public static fromECR(ecr: number[]): AbsoluteLocation {
        return null;
    }

    private toRadians(num: number): number {
        return num * (Math.PI / 180);
    }

    private toDegrees(num: number): number {
        return num * (180 / Math.PI);
    }
}
