import { AbsoluteLocation } from "./AbsoluteLocation";
import { AngleUnit } from "../../utils/unit";
import { LengthUnit } from "../../utils/unit/LengthUnit";
import { Cartesian3DLocation } from "./Cartesian3DLocation";

/**
 * Geographical location
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
    public get latitude(): number {
        return this._lat;
    }

    /**
     * Set latitude
     * @param lat 
     */
    public set latitude(lat: number) {
        this._lat = lat;
    }

    /**
     * Get longitude
     */
    public get longitude(): number {
        return this._lng;
    }

    /**
     * Set longitude
     * @param lng 
     */
    public set longitude(lng: number) {
        this._lng = lng;
    }

    /**
     * Get the altitude above mean sea level
     */
    public get altitude(): number {
        return this._amsl;
    }
    
    /**
     * Set the altitude
     * @param mamsl Above mean sea level
     */
    public set altitude(amsl: number) {
        this._amsl = amsl;
    }
    
    /**
     * Get altitude unit
     */
    public get altitudeUnit(): LengthUnit {
        return this._amslUnit;
    }

    public set altitudeUnit(altitudeUnit: LengthUnit) {
        this._amslUnit = altitudeUnit;
    }

    /**
     * Get the distance from this location to a destination
     * @param destination Destination location
     */
    public distance(destination: GeographicalLocation): number {
        const latRadA = AngleUnit.DEGREES.convert(this.latitude, AngleUnit.RADIANS);
        const latRadB = AngleUnit.DEGREES.convert(destination.latitude, AngleUnit.RADIANS);
        const deltaLat = AngleUnit.DEGREES.convert(destination.latitude - this.latitude, AngleUnit.RADIANS);
        const deltaLon = AngleUnit.DEGREES.convert(destination.longitude - this.longitude, AngleUnit.RADIANS);
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
        const lonRadA = AngleUnit.DEGREES.convert(this.longitude, AngleUnit.RADIANS);
        const latRadA = AngleUnit.DEGREES.convert(this.latitude, AngleUnit.RADIANS);
        const lonRadB = AngleUnit.DEGREES.convert(destination.longitude, AngleUnit.RADIANS);
        const latRadB = AngleUnit.DEGREES.convert(destination.latitude, AngleUnit.RADIANS);
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
        const phi = AngleUnit.DEGREES.convert(this.latitude, AngleUnit.RADIANS);
        const lambda = AngleUnit.DEGREES.convert(this.longitude, AngleUnit.RADIANS);
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
        geoLocation.latitude = (AngleUnit.RADIANS.convert(Math.asin(ecrLocation.getZ() / GeographicalLocation.EARTH_RADIUS), AngleUnit.DEGREES));
        geoLocation.longitude = (AngleUnit.RADIANS.convert(Math.atan2(ecrLocation.getY(), ecrLocation.getX()), AngleUnit.DEGREES));
        return geoLocation;
    }
}
