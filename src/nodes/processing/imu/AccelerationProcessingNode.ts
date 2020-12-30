import { DataObject, LinearVelocity, IMUDataFrame } from '../../../data';
import { FilterProcessingNode } from '../dsp';

/**
 * Acceleration processing to linear velocity
 *
 * @category Processing node
 */
export class AccelerationProcessingNode extends FilterProcessingNode<IMUDataFrame> {
    public initFilter(object: DataObject, frame: IMUDataFrame): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!frame.acceleration && !frame.linearAcceleration) {
                return reject(new Error(`Acceleration processing requires accelerometer readings!`));
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
            const accl = frame.linearAcceleration || frame.acceleration;
            const dt = 1000 / frame.frequency;
            frame.linearVelocity = LinearVelocity.fromArray(accl.clone().multiplyScalar(dt).toArray());
            const position = object.getPosition();
            if (!position) {
                return resolve(object);
            }
            if (!position.linearVelocity) {
                position.linearVelocity = frame.linearVelocity.clone();
            } else {
                position.linearVelocity.add(frame.linearVelocity);
            }
            resolve(object);
        });
    }
}
