import { FilterProcessingNode } from '../dsp';
import { DataObject, IMUDataFrame } from '../../../data';
import { Quaternion } from '../../../utils';

/**
 * Geomagnetic orientation processing node
 *
 * @source https://github.com/visakhanc/eCompass/blob/master/source/main.c
 */
export class GeomagneticOrientationProcessingNode extends FilterProcessingNode<IMUDataFrame> {
    public initFilter(object: DataObject, frame: IMUDataFrame): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (frame.angularVelocity || frame.acceleration === undefined) {
                reject(new Error(`Relative rotation processing requires accelerometer and gyroscope readings!`));
            }

            resolve({
                alpha: 0,
                beta: 0,
                gamma: 0,
            });
        });
    }

    public filter(object: DataObject, frame: IMUDataFrame): Promise<DataObject> {
        return new Promise<DataObject>((resolve) => {
            const accl = frame.acceleration;
            const mag = frame.magnetism;

            /* Calculate pitch and roll, in the range (-pi,pi) */
            const pitch = Math.atan2(-accl.x, Math.sqrt(accl.z * accl.z + accl.y * accl.y));
            const roll = Math.atan2(accl.y, Math.sqrt(accl.z * accl.z + accl.x * accl.x));

            /* Calculate Azimuth:
             * Magnetic horizontal components, after compensating for Roll(r) and Pitch(p) are:
             * Xh = X*cos(p) + Y*sin(r)*sin(p) + Z*cos(r)*sin(p)
             * Yh = Y*cos(r) - Z*sin(r)
             * Azimuth = arcTan(Y_h/X_h)
             */
            const Xh =
                mag.x * Math.cos(pitch) +
                mag.y * Math.sin(roll) * Math.sin(pitch) +
                mag.z * Math.cos(roll) * Math.sin(pitch);
            const Yh = mag.y * Math.cos(roll) - mag.z * Math.sin(roll);
            let azimuth = Math.atan2(Yh, Xh);
            if (azimuth < 0) {
                /* Convert Azimuth in the range (0, 2pi) */
                azimuth = 2 * Math.PI + azimuth;
            }

            frame.geomagneticOrientation = Quaternion.fromEuler([pitch, roll, azimuth]);

            resolve(object);
        });
    }
}
