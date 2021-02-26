import { DataObject, Acceleration, IMUDataFrame } from '../../../data';
import { AccelerationUnit } from '../../../utils';
import { FilterProcessingOptions, FilterProcessingNode } from '../dsp';

/**
 * @category Processing node
 */
export class GravityProcessingNode extends FilterProcessingNode<IMUDataFrame> {
    public initFilter(object: DataObject, frame: IMUDataFrame, options?: FilterProcessingOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!frame.absoluteOrientation && !frame.acceleration) {
                return reject(
                    new Error(`Gravity processing requires accelerometer and absolute orientation readings!`),
                );
            }
            resolve(options);
        });
    }

    public filter(object: DataObject, frame: IMUDataFrame): Promise<DataObject> {
        return new Promise<DataObject>((resolve) => {
            if (frame.acceleration && frame.linearAcceleration) {
                // Simply subtract the acceleration (with gravity) from the linear acceleration
                frame.gravity = frame.acceleration.clone().sub(frame.linearAcceleration);
            } else {
                // Use gyroscope data to filter out gravity
                const rotationMatrix = frame.absoluteOrientation.toRotationMatrix();
                frame.gravity = new Acceleration(
                    rotationMatrix.elements[8],
                    rotationMatrix.elements[9],
                    rotationMatrix.elements[10],
                    AccelerationUnit.GRAVITATIONAL_FORCE,
                );
                frame.linearAcceleration = frame.acceleration.clone().sub(frame.gravity);
            }
            resolve(object);
        });
    }
}
