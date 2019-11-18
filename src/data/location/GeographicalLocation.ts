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
     * Get the distance from this location to a destination
     * @param destination Destination location
     */
    public distance(destination: GeographicalLocation) : number{
        let R = 6371008;
        let latRad_a = this.toRadians(this.getLatitude());
        let latRad_b = this.toRadians(destination.getLatitude());
        let Δlat = this.toRadians(destination.getLatitude()-this.getLatitude());
        let Δlon = this.toRadians(destination.getLongitude()-this.getLongitude());
        let a = Math.sin(Δlat/2) * Math.sin(Δlat/2) +
                Math.cos(latRad_a) * Math.cos(latRad_b) *
                Math.sin(Δlon/2) * Math.sin(Δlon/2);
                let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }


    /**
     * Get the bearing in degrees from this location to a destination
     * @param destination Destination location
     */
    public bearing(destination: GeographicalLocation) : number {
        let lonRad_a = this.toRadians(this.getLongitude());
        let latRad_a = this.toRadians(this.getLatitude());
        let lonRad_b = this.toRadians(destination.getLongitude());
        let latRad_b = this.toRadians(destination.getLatitude());
        let y = Math.sin(lonRad_b-lonRad_a)*Math.cos(latRad_b);
        let x = Math.cos(latRad_a) * Math.sin(latRad_b) -  Math.sin(latRad_a) * Math.cos(latRad_b) * Math.cos(lonRad_b - lonRad_a);
        return this.toDegrees(Math.atan2(y,x));
    }

    public getMidpointLocation(otherLocation: AbsoluteLocation) : Promise<AbsoluteLocation> {
        return new Promise<AbsoluteLocation>((resolve,reject) => {
       
        });
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

    private toRadians(num: number) : number{
        return num * (Math.PI / 180);
    }

    private toDegrees(num: number) : number{
        return num * (180 / Math.PI);
    }
}