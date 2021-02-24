import { SerializableObject } from '../../data/decorators';
import { Vector3 } from '../math';
import { AngleUnit } from './AngleUnit';
import { Unit } from './Unit';

/**
 * Geodetic coordinate system.
 */
@SerializableObject()
export class GCS extends Unit {
    public static readonly EARTH_RADIUS = 6371008;

    public static readonly EPSG4326 = new GCS('EPSG:4326', {
        baseName: 'gcs',
        aliases: ['WGS84', 'World Geodetic System'],
    });
    public static readonly WGS84 = GCS.EPSG4326;
    public static readonly ECEF = new GCS('ECEF', {
        baseName: 'gcs',
        aliases: ['earth-centered, earth-fixed', 'ECR', 'earth centered rotational'],
        definitions: [
            {
                unit: 'EPSG:4326',
                toUnit: (input: Vector3) => {
                    return new Vector3(
                        AngleUnit.RADIAN.convert(Math.asin(input.z / GCS.EARTH_RADIUS), AngleUnit.DEGREE),
                        AngleUnit.RADIAN.convert(Math.atan2(input.y, input.x), AngleUnit.DEGREE),
                    );
                },
                fromUnit: (input: Vector3) => {
                    const phi = AngleUnit.DEGREE.convert(input.x, AngleUnit.RADIAN);
                    const lambda = AngleUnit.DEGREE.convert(input.y, AngleUnit.RADIAN);
                    return new Vector3(
                        GCS.EARTH_RADIUS * Math.cos(phi) * Math.cos(lambda),
                        GCS.EARTH_RADIUS * Math.cos(phi) * Math.sin(lambda),
                        GCS.EARTH_RADIUS * Math.sin(phi),
                    );
                },
            },
        ],
    });
    public static readonly EPSG3857 = new GCS('EPSG:3857', {
        baseName: 'gcs',
        aliases: ['pseudo mercator', 'web mercator'],
        definitions: [
            {
                unit: 'EPSG:4326',
                toUnit: (input: Vector3) => {
                    return new Vector3(
                        (input.y * 20037508.34) / 180,
                        ((Math.log(Math.tan(((90 + input.x) * Math.PI) / 360)) / (Math.PI / 180)) * 20037508.34) / 180,
                        0,
                    );
                },
                fromUnit: (input: Vector3) => {
                    return new Vector3(
                        (Math.atan(Math.exp((input.y * Math.PI) / 20037508.34)) * 360) / Math.PI - 90,
                        (input.x * 180) / 20037508.34,
                        input.z,
                    );
                },
            },
        ],
    });
}
