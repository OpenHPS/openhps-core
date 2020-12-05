import { DataObject, Acceleration, IMUDataFrame } from '../../../data';
import { FilterProcessingOptions, FilterProcessingNode } from '../dsp';

export class GravityProcessingNode extends FilterProcessingNode<IMUDataFrame> {
    public initFilter(object: DataObject, frame: IMUDataFrame, options?: FilterProcessingOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!frame.relativeOrientation && !frame.acceleration) {
                return reject(
                    new Error(`Gravity processing requires accelerometer and relative orientation readings!`),
                );
            }

            resolve(options);
        });
    }

    public filter(object: DataObject, frame: IMUDataFrame): Promise<DataObject> {
        return new Promise<DataObject>((resolve) => {
            if (frame.acceleration && frame.linearAcceleration) {
                // Simply subtract the acceleration (with gravity) from the linear acceleration
                frame.gravity = new Acceleration(
                    frame.acceleration.x - frame.linearAcceleration.x,
                    frame.acceleration.y - frame.linearAcceleration.y,
                    frame.acceleration.z - frame.linearAcceleration.z,
                );
            } else {
                // Use gyroscope data to filter out gravity
                frame.linearAcceleration = frame.acceleration
                    .clone()
                    .multiply(frame.relativeOrientation.toEuler().toVector3());
                frame.gravity = frame.acceleration.clone().sub(frame.linearAcceleration);
            }
            resolve(object);
        });
    }
}
