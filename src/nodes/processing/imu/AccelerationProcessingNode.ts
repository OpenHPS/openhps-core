import { DataFrame, DataObject, LinearVelocity, IMUDataFrame } from "../../../data";
import { FilterProcessingNode, FilterProcessingOptions } from "../dsp";

export class AccelerationProcessingNode extends FilterProcessingNode<IMUDataFrame> {

    public initFilter(object: DataObject, frame: IMUDataFrame, options?: FilterProcessingOptions): Promise<any> {
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

    public filter(object: DataObject, frame: IMUDataFrame, filter: any, options?: FilterProcessingOptions): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            const accl = frame.acceleration;
            const dt = 1000. / frame.frequency;
            frame.linearVelocity = LinearVelocity.fromArray(accl.clone().multiplyScalar(dt).toArray());
            object.getPosition().velocity.linear.add(frame.linearVelocity);
            resolve(object);
        });
    }

}
