import { AngleUnit } from '../../utils/unit/AngleUnit';
import { LengthUnit } from '../../utils/unit/LengthUnit';
import { SerializableObject, SerializableMember, NumberType } from '../decorators';
import { Absolute3DPosition } from './Absolute3DPosition';
import { GCS, HAVERSINE, Unit, Vector3 } from '../../utils';

/**
 * Geographical WGS 84 position stored as an 3D vector in ISO 6709.
 *
 * @category Position
 */
@SerializableObject()
export class GeographicalPosition extends Absolute3DPosition {
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
    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    get latitude(): number {
        return this.y;
    }

    set latitude(lat: number) {
        this.y = lat;
    }

    /**
     * Geographical Longitude
     *
     * @returns {number} Longitude
     */
    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    get longitude(): number {
        return this.x;
    }

    set longitude(lng: number) {
        this.x = lng;
    }

    /**
     * Altitude above mean sea level
     *
     * @returns {number} Altitude
     */
    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    get altitude(): number {
        return this.z;
    }

    set altitude(amsl: number) {
        this.z = amsl;
    }

    /**
     * Get the distance from this location to a destination
     *
     * @param {GeographicalPosition} destination Destination location
     * @returns {number} Distance between this point and destination
     */
    distanceTo(destination: GeographicalPosition): number {
        return super.distanceTo(destination as this, HAVERSINE);
    }

    /**
     * Get the bearing in degrees from this location to a destination
     *
     * @param {GeographicalPosition} destination Destination location
     * @returns {number} Bearing in degrees from this position to destination
     */
    bearing(destination: GeographicalPosition): number {
        return AngleUnit.RADIAN.convert(this.angleTo(destination), AngleUnit.DEGREE);
    }

    /**
     * Get the bearing in radians from this location to a destination
     *
     * @param {GeographicalPosition} destination Destination location
     * @returns {number} Bearing in radians from this position to destination
     */
    angleTo(destination: GeographicalPosition): number {
        const lonRadA = AngleUnit.DEGREE.convert(this.longitude, AngleUnit.RADIAN);
        const latRadA = AngleUnit.DEGREE.convert(this.latitude, AngleUnit.RADIAN);
        const lonRadB = AngleUnit.DEGREE.convert(destination.longitude, AngleUnit.RADIAN);
        const latRadB = AngleUnit.DEGREE.convert(destination.latitude, AngleUnit.RADIAN);
        const y = Math.sin(lonRadB - lonRadA) * Math.cos(latRadB);
        const x =
            Math.cos(latRadA) * Math.sin(latRadB) - Math.sin(latRadA) * Math.cos(latRadB) * Math.cos(lonRadB - lonRadA);
        return Math.atan2(y, x);
    }

    destination(
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
            Math.sin(latRadA) * Math.cos(distance / GCS.EARTH_RADIUS_MEAN) +
                Math.cos(latRadA) * Math.sin(distance / GCS.EARTH_RADIUS_MEAN) * Math.cos(brng),
        );
        const lonX =
            lonRadA +
            Math.atan2(
                Math.sin(brng) * Math.sin(distance / GCS.EARTH_RADIUS_MEAN) * Math.cos(latRadA),
                Math.cos(distance / GCS.EARTH_RADIUS_MEAN) - Math.sin(latRadA) * Math.sin(latX),
            );

        const location = new GeographicalPosition();
        location.latitude = AngleUnit.RADIAN.convert(latX, AngleUnit.DEGREE);
        location.longitude = AngleUnit.RADIAN.convert(lonX, AngleUnit.DEGREE);
        location.altitude = this.altitude;
        location.unit = this.unit;
        return location;
    }

    fromVector(vector: Vector3, unit?: LengthUnit): this;
    fromVector(vector: Vector3, unit?: GCS): this;
    fromVector(vector: Vector3, unit: Unit = GCS.WGS84): this {
        let converted: Vector3;
        if (unit instanceof LengthUnit) {
            converted = GCS.ECEF.convert(
                new Vector3(
                    unit.convert(vector.x, LengthUnit.METER),
                    unit.convert(vector.y, LengthUnit.METER),
                    unit.convert(vector.z, LengthUnit.METER),
                ),
                GCS.WGS84,
            );
        } else if (unit instanceof GCS) {
            converted = unit.convert(vector, GCS.WGS84);
        }
        this.x = converted.x;
        this.y = converted.y;
        this.z = converted.z;
        return this;
    }

    /**
     * Convert the geographical position to a vector
     * with geographical coordinate system ECEF.
     *
     * @param {LengthUnit} [unit] Metric length unit
     * @returns {Vector3} Vector of the position
     */
    toVector3(unit?: LengthUnit): Vector3;
    /**
     * Convert the geographical position to a vector
     *
     * @param {GCS} [unit=GCS.WGS84] coordinate system
     * @returns {Vector3} Vector of the position
     */
    toVector3(unit?: GCS): Vector3;
    toVector3(unit: Unit = GCS.WGS84): Vector3 {
        if (unit instanceof GCS) {
            return GCS.WGS84.convert(new Vector3(this.x, this.y, this.z), unit);
        } else if (unit instanceof LengthUnit) {
            return GCS.WGS84.convert(
                new Vector3(
                    LengthUnit.METER.convert(this.x, unit),
                    LengthUnit.METER.convert(this.y, unit),
                    LengthUnit.METER.convert(this.z, unit),
                ),
                GCS.ECEF,
            );
        }
    }

    /**
     * Clone the position
     *
     * @returns {GeographicalPosition} Cloned geographical position
     */
    clone(): this {
        const position = super.clone();
        position.latitude = this.latitude;
        position.longitude = this.longitude;
        position.z = this.altitude;
        return position as this;
    }
}
