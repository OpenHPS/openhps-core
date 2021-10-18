import { SerializableObject } from '../../data/decorators';
import { Vector3 } from '../math/Vector3';
import { AngleUnit } from './AngleUnit';
import { Unit } from './Unit';

/**
 * Geodetic coordinate system.
 */
@SerializableObject()
export class GCS extends Unit {
    static readonly EARTH_RADIUS = 6371008;

    static readonly EPSG4326 = new GCS('EPSG:4326', {
        baseName: 'gcs',
        aliases: ['WGS84', 'World Geodetic System'],
    });
    static readonly WGS84 = GCS.EPSG4326;
    static readonly ECEF = new GCS('ECEF', {
        baseName: 'gcs',
        aliases: ['earth-centered, earth-fixed', 'ECR', 'earth centered rotational'],
        definitions: [
            {
                unit: 'EPSG:4326',
                toUnit: (input: Vector3) => {
                    return new Vector3(
                        AngleUnit.RADIAN.convert(Math.atan2(input.y, input.x), AngleUnit.DEGREE),
                        AngleUnit.RADIAN.convert(Math.asin(input.z / GCS.EARTH_RADIUS), AngleUnit.DEGREE),
                    );
                },
                fromUnit: (input: Vector3) => {
                    const phi = AngleUnit.DEGREE.convert(input.y, AngleUnit.RADIAN);
                    const lambda = AngleUnit.DEGREE.convert(input.x, AngleUnit.RADIAN);
                    return new Vector3(
                        GCS.EARTH_RADIUS * Math.cos(phi) * Math.cos(lambda),
                        GCS.EARTH_RADIUS * Math.cos(phi) * Math.sin(lambda),
                        GCS.EARTH_RADIUS * Math.sin(phi),
                    );
                },
            },
        ],
    });
    static readonly EPSG3857 = new GCS('EPSG:3857', {
        baseName: 'gcs',
        aliases: ['pseudo mercator', 'web mercator'],
        definitions: [
            {
                unit: 'EPSG:4326',
                fromUnit: (input: Vector3) => {
                    return new Vector3(
                        (input.x * 20037508.34) / 180,
                        ((Math.log(Math.tan(((90 + input.y) * Math.PI) / 360)) / (Math.PI / 180)) * 20037508.34) / 180,
                        0,
                    );
                },
                toUnit: (input: Vector3) => {
                    return new Vector3(
                        (input.x * 180) / 20037508.34,
                        (Math.atan(Math.exp((input.y * Math.PI) / 20037508.34)) * 360) / Math.PI - 90,
                        input.z,
                    );
                },
            },
        ],
    });
}
