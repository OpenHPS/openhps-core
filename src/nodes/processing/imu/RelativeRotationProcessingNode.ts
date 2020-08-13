import { DataFrame, DataObject, IMUDataFrame } from "../../../data";
import { Quaternion } from "../../../utils";
import { FilterProcessingNode, FilterProcessingOptions } from "../dsp";

/**
 * Relative rotation processing node
 * @source https://www.w3.org/TR/motion-sensors/#relative-orientation-sensor
 */
export class RelativeRotationProcessingNode extends FilterProcessingNode<DataFrame> {

    public initFilter(object: DataObject, frame: IMUDataFrame, options?: FilterProcessingOptions): Promise<any> {
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

    public filter(object: DataObject, frame: IMUDataFrame, filter: any, options?: FilterProcessingOptions): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            const accl = frame.acceleration;
            const gyro = object.getPosition().velocity.angular;
            const bias = 0.98;

            const dt = 1000. / frame.frequency;
            
            // Treat the acceleration vector as an orientation vector by normalizing it.
            // Keep in mind that the if the device is flipped, the vector will just be
            // pointing in the other direction, so we have no way to know from the
            // accelerometer data which way the device is oriented.
            const norm = Math.sqrt(accl.x ** 2 + accl.y ** 2 + accl.z ** 2);

            // As we only can cover half (PI rad) of the full spectrum (2*PI rad) we multiply
            // the unit vector with values from [-1, 1] with PI/2, covering [-PI/2, PI/2].
            const scale = Math.PI / 2;

            const alpha: number = filter.alpha + gyro.z * dt;
            const beta: number = bias * (filter.beta + gyro.x * dt) + (1.0 - bias) * (accl.x * scale / norm);
            const gamma: number = bias * (filter.gamma + gyro.y * dt) + (1.0 - bias) * (accl.y * -scale / norm);

            frame.relativeOrientation = Quaternion.fromEuler([beta, gamma, alpha]);

            resolve(object);
        });
    }

}
