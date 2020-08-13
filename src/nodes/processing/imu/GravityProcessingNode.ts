import { DataFrame, DataObject, Acceleration, IMUDataFrame } from "../../../data";
import { FilterProcessingOptions, FilterProcessingNode } from "../dsp";

export class GravityProcessingNode extends FilterProcessingNode<IMUDataFrame> {

    public initFilter(object: DataObject, frame: IMUDataFrame, options?: FilterProcessingOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (frame.angularVelocity || frame.acceleration === undefined) {
                reject(new Error(`Gravity processing requires accelerometer and gyroscope readings!`));
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
            if (frame.acceleration) {
                // Simply subtract the acceleration (with gravity) from the linear acceleration
                frame.gravity = new Acceleration(frame.acceleration.x - frame.linearAcceleration.x,
                    frame.acceleration.y - frame.linearAcceleration.y,
                    frame.acceleration.z - frame.linearAcceleration.z);
            } else {

            }
            resolve(object);
        });
    }

}
