import { DataObject, LinearVelocity, IMUDataFrame } from "../../../data";
import { FilterProcessingNode } from "../dsp";

/**
 * Acceleration processing to linear velocity
 */
export class AccelerationProcessingNode extends FilterProcessingNode<IMUDataFrame> {

    public initFilter(object: DataObject, frame: IMUDataFrame): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (frame.acceleration === undefined) {
                reject(new Error(`Acceleration processing requires accelerometer readings!`));
            }

            resolve({
                alpha: 0,
                beta: 0,
                gamma: 0,
            });
        });
    }

    public filter(object: DataObject, frame: IMUDataFrame): Promise<DataObject> {
        return new Promise<DataObject>(resolve => {
            const accl = frame.acceleration;
            const dt = 1000. / frame.frequency;
            frame.linearVelocity = LinearVelocity.fromArray(accl.clone().multiplyScalar(dt).toArray());
            if (object.getPosition()) {
                object.getPosition().velocity.linear.add(frame.linearVelocity);
            }
            resolve(object);
        });
    }

}
