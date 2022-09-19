import { SerializableObject } from '../../data/decorators';
import { Vector3 } from '../math/Vector3';
import { AngleUnit } from './AngleUnit';
import { Unit } from './Unit';

/**
 * Geodetic coordinate system.
 */
@SerializableObject()
export class GCS extends Unit {
    static readonly EARTH_RADIUS_MEAN = 6371008.7714;
    static readonly EARTH_EQUATORIAL_RADIUS = 6378137;
    static readonly EARTH_POLAR_RADIUS = 6356752.3142;
    static readonly EARTH_ECCENTRICITY = 8.1819190842622e-2;

    /**
     * @deprecated Use GCS.EARTH_RADIUS_MEAN
     * @returns {number} Mean earth radius
     */
    static get EARTH_RADIUS(): number {
        return GCS.EARTH_RADIUS_MEAN;
    }

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
                    /* @see {@link https://gis.stackexchange.com/questions/265909/converting-from-ecef-to-geodetic-coordinates} */
                    const f = 1.0 / 298.257223563;
                    const a = GCS.EARTH_EQUATORIAL_RADIUS;
                    const b = a - f * a;
                    const e = Math.sqrt(Math.pow(a, 2) - Math.pow(b, 2)) / a;
                    const clambda = Math.atan2(input.y, input.x);
                    const p = Math.sqrt(Math.pow(input.x, 2.0) + Math.pow(input.y, 2));
                    let h_old = 0.0;
                    // First guess with h=0 meters
                    let theta = Math.atan2(input.z, p * (1.0 - Math.pow(e, 2.0)));
                    let cs = Math.cos(theta);
                    let sn = Math.sin(theta);
                    let N = Math.pow(a, 2.0) / Math.sqrt(Math.pow(a * cs, 2.0) + Math.pow(b * sn, 2.0));
                    let h = p / cs - N;
                    while (Math.abs(h - h_old) > 1.0e-6) {
                        h_old = h;
                        theta = Math.atan2(input.z, p * (1.0 - (Math.pow(e, 2.0) * N) / (N + h)));
                        cs = Math.cos(theta);
                        sn = Math.sin(theta);
                        N = Math.pow(a, 2.0) / Math.sqrt(Math.pow(a * cs, 2.0) + Math.pow(b * sn, 2.0));
                        h = p / cs - N;
                    }
                    return new Vector3(
                        AngleUnit.RADIAN.convert(clambda, AngleUnit.DEGREE),
                        AngleUnit.RADIAN.convert(theta, AngleUnit.DEGREE),
                        h,
                    );
                },
                fromUnit: (input: Vector3) => {
                    const phi = AngleUnit.DEGREE.convert(input.y, AngleUnit.RADIAN);
                    const lambda = AngleUnit.DEGREE.convert(input.x, AngleUnit.RADIAN);
                    const height = input.z ?? 0;
                    const clat = Math.cos(phi);
                    const slat = Math.sin(phi);
                    const clon = Math.cos(lambda);
                    const slon = Math.sin(lambda);
                    const N =
                        GCS.EARTH_EQUATORIAL_RADIUS /
                        Math.sqrt(1.0 - Math.pow(GCS.EARTH_ECCENTRICITY, 2) * Math.pow(slat, 2));
                    return new Vector3(
                        (N + height) * clat * clon,
                        (N + height) * clat * slon,
                        (N * (1 - Math.pow(GCS.EARTH_ECCENTRICITY, 2)) + height) * slat,
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
