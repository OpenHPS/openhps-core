import { DataObject, Acceleration, IMUDataFrame } from '../../../data';
import { FilterProcessingOptions, FilterProcessingNode } from '../dsp';

export class GravityProcessingNode extends FilterProcessingNode<IMUDataFrame> {
    public initFilter(object: DataObject, frame: IMUDataFrame, options?: FilterProcessingOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (frame.angularVelocity || frame.acceleration === undefined) {
                reject(new Error(`Gravity processing requires accelerometer and gyroscope readings!`));
            }

            resolve(options);
        });
    }

    public filter(object: DataObject, frame: IMUDataFrame): Promise<DataObject> {
        return new Promise<DataObject>((resolve) => {
            if (frame.acceleration) {
                // Simply subtract the acceleration (with gravity) from the linear acceleration
                frame.gravity = new Acceleration(
                    frame.acceleration.x - frame.linearAcceleration.x,
                    frame.acceleration.y - frame.linearAcceleration.y,
                    frame.acceleration.z - frame.linearAcceleration.z,
                );
            }
            resolve(object);
        });
    }
}
