import { DataFrame, DataObject, AbsolutePosition } from "../../../data";
import * as math from 'mathjs';
import { ObjectProcessingNode } from "../../ObjectProcessingNode";
import { Quaternion, TimeUnit, Euler } from "../../../utils";

/**
 * Linear and angular velocity processing
 */
export class VelocityProcessingNode<InOut extends DataFrame = DataFrame> extends ObjectProcessingNode<InOut> {
    private _timeFn: () => number = () => new Date().getTime();
    private _timeUnit: TimeUnit = TimeUnit.MILLI;

    /**
     * Manually set the function used to get the current time stamp
     * @param timeFn Time function
     */
    public timeFunction(timeFn: () => number, timeUnit: TimeUnit): VelocityProcessingNode<InOut> {
        this._timeFn = timeFn;
        this._timeUnit = timeUnit;
        return this;
    }

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (object.getPosition() !== undefined) {
                const lastPosition = object.getPosition().clone<AbsolutePosition>();
                if (lastPosition.velocity !== undefined) {
                    // Time since current calculation and previous velocity
                    const deltaTime = this._timeUnit.convert(this._timeFn() - lastPosition.timestamp, TimeUnit.SECOND);

                    if (deltaTime < 0) {
                        // Delta time is negative, this means the previous location
                        // timestamp was incorrect
                        return resolve(object);
                    }

                    // Process the linear velocity
                    const dX = lastPosition.velocity.linear.x;
                    const dY = lastPosition.velocity.linear.y;
                    const dZ = lastPosition.velocity.linear.z;
                    const translationMatrix = math.multiply([
                        [1, 0, 0, 0],
                        [0, 1, 0, 0],
                        [0, 0, 1, 0],
                        [dX, dY, dZ, 1]
                    ], deltaTime);
                    
                    // Process the angular velocity
                    const orientation = lastPosition.orientation.toEuler();
                    const roll = math.add(math.multiply(lastPosition.velocity.angular.x, deltaTime), orientation.x) as number;
                    const pitch = math.add(math.multiply(lastPosition.velocity.angular.y, deltaTime), orientation.y) as number;
                    const yaw = math.add(math.multiply(lastPosition.velocity.angular.z, deltaTime), orientation.z) as number;
                    const rotationMatrix = Quaternion.fromEuler({ yaw, pitch, roll }).toRotationMatrix();
                    
                    // Create transformation matrix from linear and angular velocity
                    const transformationMatrix = math.multiply(translationMatrix, rotationMatrix);
                    
                    // The relative position is the transformation matrix rotated using the orientation
                    const relativePosition = math.multiply([0, 0, 0, 1], transformationMatrix);
                    const relativeOrientation = math.multiply(lastPosition.velocity.angular.toVector(), deltaTime);

                    // Predict the next location
                    const newPosition = lastPosition;
                    newPosition.timestamp = this._timeFn();
                    const point = newPosition.toVector();
                    if (point.length === 3) {
                        point.push(1);
                    } else {
                        point.push(0, 1);
                    }

                    // New orientation in radians
                    const newOrientation = math.add(lastPosition.orientation.toEuler(), relativeOrientation) as number[];
                    newPosition.orientation = Quaternion.fromEuler(newOrientation);
                    newPosition.fromVector(math.add(point, relativePosition) as number[]);
                    object.setPosition(newPosition);
                }
            }
            resolve(object);
        });
    }

}
