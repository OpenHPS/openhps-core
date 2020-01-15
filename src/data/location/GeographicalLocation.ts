import { AbsoluteLocation } from "./AbsoluteLocation";
import { AngleUnit } from "../../utils/unit";
import { LengthUnit } from "../../utils/unit/LengthUnit";
import { Cartesian3DLocation } from "./Cartesian3DLocation";

/**
 * # OpenHPS: Geographical location
 */
export class GeographicalLocation extends AbsoluteLocation {
    protected _lat: number;
    protected _lng: number;
    protected _amsl: number;
    protected _amslUnit: LengthUnit;

    public static EARTH_RADIUS: number = 6371008; 

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
     * Get the altitude above mean sea level
     */
    public getAltitude(): number {
        return this._amsl;
    }

    /**
     * Get altitude unit
     */
    public getAltitudeUnit(): LengthUnit {
        return this._amslUnit;
    }

    /**
     * Set the altitude
     * @param mamsl Above mean sea level
     * @param unit Length unit
     */
    public setAltitude(amsl: number, unit: LengthUnit): void {
        this._amsl = amsl;
        this._amslUnit = unit;
    }

    /**
     * Get the distance from this location to a destination
     * @param destination Destination location
     */
    public distance(destination: GeographicalLocation): number {
        const latRadA = AngleUnit.DEGREES.convert(this.getLatitude(), AngleUnit.RADIANS);
        const latRadB = AngleUnit.DEGREES.convert(destination.getLatitude(), AngleUnit.RADIANS);
        const deltaLat = AngleUnit.DEGREES.convert(destination.getLatitude() - this.getLatitude(), AngleUnit.RADIANS);
        const deltaLon = AngleUnit.DEGREES.convert(destination.getLongitude() - this.getLongitude(), AngleUnit.RADIANS);
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(latRadA) * Math.cos(latRadB) *
                Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return GeographicalLocation.EARTH_RADIUS * c;
    }


    /**
     * Get the bearing in degrees from this location to a destination
     * @param destination Destination location
     */
    public bearing(destination: GeographicalLocation): number {
        const lonRadA = AngleUnit.DEGREES.convert(this.getLongitude(), AngleUnit.RADIANS);
        const latRadA = AngleUnit.DEGREES.convert(this.getLatitude(), AngleUnit.RADIANS);
        const lonRadB = AngleUnit.DEGREES.convert(destination.getLongitude(), AngleUnit.RADIANS);
        const latRadB = AngleUnit.DEGREES.convert(destination.getLatitude(), AngleUnit.RADIANS);
        const y = Math.sin(lonRadB - lonRadA) * Math.cos(latRadB);
        const x = Math.cos(latRadA) * Math.sin(latRadB) -  Math.sin(latRadA) * Math.cos(latRadB) * Math.cos(lonRadB - lonRadA);
        return AngleUnit.RADIANS.convert(Math.atan2(y, x), AngleUnit.DEGREES);
    }

    public getMidpointLocation(otherLocation: GeographicalLocation): Promise<GeographicalLocation> {
        return new Promise<GeographicalLocation>((resolve, reject) => {
       
        });
    }

    /**
     * Convert the point to an ECR point (Earth Centered Rotational)
     */
    public toECR(): Cartesian3DLocation {
        const ecr = new Cartesian3DLocation();
        const phi = AngleUnit.DEGREES.convert(this.getLatitude(), AngleUnit.RADIANS);
        const lambda = AngleUnit.DEGREES.convert(this.getLongitude(), AngleUnit.RADIANS);
        // Convert ECR positions
        ecr.setX(GeographicalLocation.EARTH_RADIUS * Math.cos(phi) * Math.cos(lambda));
        ecr.setY(GeographicalLocation.EARTH_RADIUS * Math.cos(phi) * Math.sin(lambda));
        ecr.setZ(GeographicalLocation.EARTH_RADIUS * Math.sin(phi));
        return ecr;
    }

    /**
     * Convert the ECR point to an absolute location
     * @param ecrLocation Earth Centered Rotational
     */
    public static fromECR(ecrLocation: Cartesian3DLocation): GeographicalLocation {
        const geoLocation = new GeographicalLocation();
        geoLocation.setLatitude(AngleUnit.RADIANS.convert(Math.asin(ecrLocation.getZ() / GeographicalLocation.EARTH_RADIUS), AngleUnit.DEGREES));
        geoLocation.setLongitude(AngleUnit.RADIANS.convert(Math.atan2(ecrLocation.getY(), ecrLocation.getX()), AngleUnit.DEGREES));
        return geoLocation;
    }
}
