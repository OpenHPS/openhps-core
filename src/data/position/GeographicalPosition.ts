import { AngleUnit } from '../../utils/unit/AngleUnit';
import { LengthUnit } from '../../utils/unit/LengthUnit';
import { SerializableObject, SerializableMember } from '../decorators';
import { Absolute3DPosition } from './Absolute3DPosition';
import { GCS, Vector3 } from '../../utils';

/**
 * Geographical position
 *
 * @category Position
 */
@SerializableObject()
export class GeographicalPosition extends Absolute3DPosition {
    public static EARTH_RADIUS = 6371008;

    constructor(lat?: number, lng?: number, amsl?: number) {
        super();
        this.latitude = lat;
        this.longitude = lng;
        this.z = amsl;
    }

    /**
     * Geographical Latitude
     *
     * @returns {number} Latitude
     */
    @SerializableMember()
    public get latitude(): number {
        return this.x;
    }

    public set latitude(lat: number) {
        this.x = lat;
    }

    /**
     * Geographical Longitude
     *
     * @returns {number} Longitude
     */
    @SerializableMember()
    public get longitude(): number {
        return this.y;
    }

    public set longitude(lng: number) {
        this.y = lng;
    }

    /**
     * Altitude above mean sea level
     *
     * @returns {number} Altitude
     */
    @SerializableMember()
    public get altitude(): number {
        return this.z;
    }

    public set altitude(amsl: number) {
        this.z = amsl;
    }

    /**
     * Get the distance from this location to a destination
     *
     * @param {GeographicalPosition} destination Destination location
     * @returns {number} Distance between this point and destination
     */
    public distanceTo(destination: GeographicalPosition): number {
        const latRadA = AngleUnit.DEGREE.convert(this.latitude, AngleUnit.RADIAN);
        const latRadB = AngleUnit.DEGREE.convert(destination.latitude, AngleUnit.RADIAN);
        const deltaLat = AngleUnit.DEGREE.convert(destination.latitude - this.latitude, AngleUnit.RADIAN);
        const deltaLon = AngleUnit.DEGREE.convert(destination.longitude - this.longitude, AngleUnit.RADIAN);
        const a =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(latRadA) * Math.cos(latRadB) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return GeographicalPosition.EARTH_RADIUS * c;
    }

    /**
     * Get the bearing in degrees from this location to a destination
     *
     * @param {GeographicalPosition} destination Destination location
     * @returns {number} Bearing in degrees from this position to destination
     */
    public bearing(destination: GeographicalPosition): number {
        const lonRadA = AngleUnit.DEGREE.convert(this.longitude, AngleUnit.RADIAN);
        const latRadA = AngleUnit.DEGREE.convert(this.latitude, AngleUnit.RADIAN);
        const lonRadB = AngleUnit.DEGREE.convert(destination.longitude, AngleUnit.RADIAN);
        const latRadB = AngleUnit.DEGREE.convert(destination.latitude, AngleUnit.RADIAN);
        const y = Math.sin(lonRadB - lonRadA) * Math.cos(latRadB);
        const x =
            Math.cos(latRadA) * Math.sin(latRadB) - Math.sin(latRadA) * Math.cos(latRadB) * Math.cos(lonRadB - lonRadA);
        return AngleUnit.RADIAN.convert(Math.atan2(y, x), AngleUnit.DEGREE);
    }

    public destination(
        bearing: number,
        distance: number,
        bearingUnit = AngleUnit.DEGREE,
        distanceUnit = LengthUnit.METER,
    ): GeographicalPosition {
        distance = distanceUnit.convert(distance, LengthUnit.METER);
        const brng = bearingUnit.convert(bearing, AngleUnit.RADIAN);
        const lonRadA = bearingUnit.convert(this.longitude, AngleUnit.RADIAN);
        const latRadA = bearingUnit.convert(this.latitude, AngleUnit.RADIAN);
        const latX = Math.asin(
            Math.sin(latRadA) * Math.cos(distance / GeographicalPosition.EARTH_RADIUS) +
                Math.cos(latRadA) * Math.sin(distance / GeographicalPosition.EARTH_RADIUS) * Math.cos(brng),
        );
        const lonX =
            lonRadA +
            Math.atan2(
                Math.sin(brng) * Math.sin(distance / GeographicalPosition.EARTH_RADIUS) * Math.cos(latRadA),
                Math.cos(distance / GeographicalPosition.EARTH_RADIUS) - Math.sin(latRadA) * Math.sin(latX),
            );

        const location = new GeographicalPosition();
        location.latitude = AngleUnit.RADIAN.convert(latX, AngleUnit.DEGREE);
        location.longitude = AngleUnit.RADIAN.convert(lonX, AngleUnit.DEGREE);
        return location;
    }

    /**
     * Get the midpoint of two geographical locations
     *
     * @param {GeographicalPosition} otherPosition Other position to get midpoint from
     * @param {number} [distanceSelf=1] Distance to itself and midpoint
     * @param {number} [distanceOther=1] Distance from other position to midpoint
     * @returns {GeographicalPosition} Calculated midpoint
     */
    public midpoint(otherPosition: GeographicalPosition, distanceSelf = 1, distanceOther = 1): GeographicalPosition {
        if (distanceOther === distanceSelf) {
            const lonRadA = AngleUnit.DEGREE.convert(this.longitude, AngleUnit.RADIAN);
            const latRadA = AngleUnit.DEGREE.convert(this.latitude, AngleUnit.RADIAN);
            const lonRadB = AngleUnit.DEGREE.convert(otherPosition.longitude, AngleUnit.RADIAN);
            const latRadB = AngleUnit.DEGREE.convert(otherPosition.latitude, AngleUnit.RADIAN);

            const Bx = Math.cos(latRadB) * Math.cos(lonRadB - lonRadA);
            const By = Math.cos(latRadB) * Math.sin(lonRadB - lonRadA);
            const latX = Math.atan2(
                Math.sin(latRadA) + Math.sin(latRadB),
                Math.sqrt((Math.cos(latRadA) + Bx) * (Math.cos(latRadA) + Bx) + By * By),
            );
            const lonX = lonRadA + Math.atan2(By, Math.cos(latRadA) + Bx);

            const location = new GeographicalPosition();
            location.latitude = AngleUnit.RADIAN.convert(latX, AngleUnit.DEGREE);
            location.longitude = AngleUnit.RADIAN.convert(lonX, AngleUnit.DEGREE);
            return location;
        } else {
            // Calculate bearings
            const bearingAB = this.bearing(otherPosition);
            const bearingBA = otherPosition.bearing(this);
            // Calculate two reference points
            const C = this.destination(bearingAB, distanceSelf);
            const D = otherPosition.destination(bearingBA, distanceOther);
            // Calculate the middle of C and D
            const midpoint = C.midpoint(D);
            midpoint.accuracy = Math.round((C.distanceTo(D) / 2) * 100) / 100;
            return midpoint;
        }
    }

    public fromVector(vector: Vector3, unit: GCS = GCS.WGS84): void {
        const converted = unit.convert(vector, GCS.WGS84);
        this.x = converted.x;
        this.y = converted.y;
        this.z = converted.z;
    }

    public toVector3(unit: GCS = GCS.ECEF): Vector3 {
        return GCS.WGS84.convert(this, unit);
    }

    /**
     * Clone the position
     *
     * @returns {GeographicalPosition} Cloned geographical position
     */
    public clone(): this {
        const position = new GeographicalPosition(this.latitude, this.longitude, this.altitude);
        position.unit = this.unit;
        position.accuracy = this.accuracy;
        position.orientation = this.orientation ? this.orientation.clone() : undefined;
        position.linearVelocity = this.linearVelocity ? this.linearVelocity.clone() : undefined;
        position.angularVelocity = this.angularVelocity ? this.angularVelocity.clone() : undefined;
        position.timestamp = this.timestamp;
        position.referenceSpaceUID = this.referenceSpaceUID;
        return position as this;
    }
}
