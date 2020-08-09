import { AngleUnit } from "../../utils/unit";
import { LengthUnit } from "../../utils/unit/LengthUnit";
import { SerializableObject, SerializableMember } from "../decorators";
import { Absolute3DPosition } from "./Absolute3DPosition";
import { Vector3 } from "../../utils";

/**
 * Geographical position
 */
@SerializableObject()
export class GeographicalPosition extends Absolute3DPosition {
    private _lat: number;
    private _lng: number;
    private _amsl: number;
    private _amslUnit: LengthUnit;
    // Internal
    private _phi: number;
    private _lambda: number;

    public static EARTH_RADIUS: number = 6371008; 

    constructor(lat?: number, lng?: number, amsl?: number) {
        super();
        this.latitude = lat;
        this.longitude = lng;
        this._amsl = amsl;
    }

    public get x(): number {
        return GeographicalPosition.EARTH_RADIUS * Math.cos(this._phi) * Math.cos(this._lambda);
    }

    public set x(value: number) {

    }

    public get y(): number {
        return GeographicalPosition.EARTH_RADIUS * Math.cos(this._phi) * Math.sin(this._lambda);
    }

    public set y(value: number) {
        
    }

    public get z(): number {
        return GeographicalPosition.EARTH_RADIUS * Math.sin(this._phi);
    }
    
    public set z(value: number) {
        
    }

    /**
     * Geographical Latitude
     */
    @SerializableMember()
    public get latitude(): number {
        return this._lat;
    }

    public set latitude(lat: number) {
        this._lat = lat;
        this._phi = AngleUnit.DEGREE.convert(this.latitude, AngleUnit.RADIAN);
    }

    /**
     * Geographical Latitude
     */
    public get lat(): number {
        return this.latitude;
    }

    public set lat(lat: number) {
        this.latitude = lat;
    }

    /**
     * Geographical Longitude
     */
    @SerializableMember()
    public get longitude(): number {
        return this._lng;
    }

    public set longitude(lng: number) {
        this._lng = lng;
        this._lambda = AngleUnit.DEGREE.convert(this.longitude, AngleUnit.RADIAN);
    }

    /**
     * Geographical Longitude
     */
    @SerializableMember()
    public get lng(): number {
        return this._lng;
    }

    public set lng(lng: number) {
        this._lng = lng;
    }

    /**
     * Altitude above mean sea level
     */
    @SerializableMember()
    public get altitude(): number {
        return this._amsl;
    }
    
    public set altitude(amsl: number) {
        this._amsl = amsl;
    }
    
    /**
     * Altitude unit
     */
    @SerializableMember()
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
    public distance(destination: GeographicalPosition): number {
        const latRadA = AngleUnit.DEGREE.convert(this.latitude, AngleUnit.RADIAN);
        const latRadB = AngleUnit.DEGREE.convert(destination.latitude, AngleUnit.RADIAN);
        const deltaLat = AngleUnit.DEGREE.convert(destination.latitude - this.latitude, AngleUnit.RADIAN);
        const deltaLon = AngleUnit.DEGREE.convert(destination.longitude - this.longitude, AngleUnit.RADIAN);
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(latRadA) * Math.cos(latRadB) *
                Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return GeographicalPosition.EARTH_RADIUS * c;
    }


    /**
     * Get the bearing in degrees from this location to a destination
     * @param destination Destination location
     */
    public bearing(destination: GeographicalPosition): number {
        const lonRadA = AngleUnit.DEGREE.convert(this.longitude, AngleUnit.RADIAN);
        const latRadA = AngleUnit.DEGREE.convert(this.latitude, AngleUnit.RADIAN);
        const lonRadB = AngleUnit.DEGREE.convert(destination.longitude, AngleUnit.RADIAN);
        const latRadB = AngleUnit.DEGREE.convert(destination.latitude, AngleUnit.RADIAN);
        const y = Math.sin(lonRadB - lonRadA) * Math.cos(latRadB);
        const x = Math.cos(latRadA) * Math.sin(latRadB) -  Math.sin(latRadA) * Math.cos(latRadB) * Math.cos(lonRadB - lonRadA);
        return AngleUnit.RADIAN.convert(Math.atan2(y, x), AngleUnit.DEGREE);
    }

    public destination(
        bearing: number, 
        distance: number, 
        bearingUnit: AngleUnit = AngleUnit.DEGREE, 
        distanceUnit: LengthUnit = LengthUnit.METER): Promise<GeographicalPosition> {
        return new Promise<GeographicalPosition>((resolve, reject) => {
            const brng = bearingUnit.convert(bearing, AngleUnit.RADIAN);
            const lonRadA = bearingUnit.convert(this.longitude, AngleUnit.RADIAN);
            const latRadA = bearingUnit.convert(this.latitude, AngleUnit.RADIAN);
            const latX = Math.asin(Math.sin(latRadA) * Math.cos(distance / GeographicalPosition.EARTH_RADIUS) +
                        Math.cos(latRadA) * Math.sin(distance / GeographicalPosition.EARTH_RADIUS) * Math.cos(brng));
            const lonX = lonRadA + Math.atan2(Math.sin(brng) * Math.sin(distance / GeographicalPosition.EARTH_RADIUS) * Math.cos(latRadA),
                                    Math.cos(distance / GeographicalPosition.EARTH_RADIUS) - Math.sin(latRadA) * Math.sin(latX));
    
            const location = new GeographicalPosition();
            location.latitude = AngleUnit.RADIAN.convert(latX, AngleUnit.DEGREE);
            location.longitude = AngleUnit.RADIAN.convert(lonX, AngleUnit.DEGREE);
            resolve(location);
        });
    }

    /**
     * Get the midpoint of two geographical locations
     * @param otherPosition Other location to get midpoint from
     */
    public midpoint(otherPosition: GeographicalPosition, distanceSelf: number = 1, distanceOther: number = 1): Promise<GeographicalPosition> {
        return new Promise<GeographicalPosition>((resolve, reject) => {
            if (distanceOther === distanceSelf) {
                const lonRadA = AngleUnit.DEGREE.convert(this.longitude, AngleUnit.RADIAN);
                const latRadA = AngleUnit.DEGREE.convert(this.latitude, AngleUnit.RADIAN);
                const lonRadB = AngleUnit.DEGREE.convert(otherPosition.longitude, AngleUnit.RADIAN);
                const latRadB = AngleUnit.DEGREE.convert(otherPosition.latitude, AngleUnit.RADIAN);
        
                const Bx = Math.cos(latRadB) * Math.cos(lonRadB - lonRadA);
                const By = Math.cos(latRadB) * Math.sin(lonRadB - lonRadA);
                const latX = Math.atan2(Math.sin(latRadA) + Math.sin(latRadB),
                                    Math.sqrt((Math.cos(latRadA) + Bx) * (Math.cos(latRadA) + Bx) + By * By));
                const lonX = lonRadA + Math.atan2(By, Math.cos(latRadA) + Bx);
        
                const location = new GeographicalPosition();
                location.latitude = AngleUnit.RADIAN.convert(latX, AngleUnit.DEGREE);
                location.longitude = AngleUnit.RADIAN.convert(lonX, AngleUnit.DEGREE);
                resolve(location);
            } else {
                // Calculate bearings
                const bearingAB = this.bearing(otherPosition);
                const bearingBA = otherPosition.bearing(this);
                // Calculate two reference points
                const destinationPromises = new Array();
                destinationPromises.push(this.destination(bearingAB, distanceSelf));
                destinationPromises.push(otherPosition.destination(bearingBA, distanceOther));

                Promise.all(destinationPromises).then(destinations => {
                    const C = destinations[0];
                    const D = destinations[1];
                    // Calculate the middle of C and D
                    const midpoint = C.midpoint(D);
                    midpoint.accuracy = Math.round((C.distance(D) / 2) * 100.) / 100.;
                    resolve(midpoint);
                }).catch(ex => {
                    reject(ex);
                });
            }
        });
    }

    public fromVector(vector: Vector3, unit?: LengthUnit): void {
        this.latitude = AngleUnit.RADIAN.convert(Math.asin(vector.z / GeographicalPosition.EARTH_RADIUS), AngleUnit.DEGREE);
        this.longitude = AngleUnit.RADIAN.convert(Math.atan2(vector.y, vector.x), AngleUnit.DEGREE);
    }

    /**
     * Clone the position
     */
    public clone(): this {
        const position = new GeographicalPosition(this.lat, this.lng, this.altitude);
        position.unit = this.unit;
        position.accuracy = this.accuracy;
        position.accuracyUnit = this.accuracyUnit;
        position.orientation = this.orientation.clone();
        position.altitudeUnit = this.altitudeUnit;
        position.velocity = this.velocity.clone();
        position.timestamp = this.timestamp;
        position.referenceSpaceUID = this.referenceSpaceUID;
        return position as this;
    }


}
