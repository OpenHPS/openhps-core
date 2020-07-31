import { DataFrame, DataObject, AbsolutePosition } from "../../../data";
import * as math from 'mathjs';
import { ObjectProcessingNode } from "../../ObjectProcessingNode";
import { Quaternion, TimeUnit, AngleUnit } from "../../../utils";

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
                        return resolve();
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
                    const orientation = lastPosition.orientation.toEuler().toVector();
                    const rX = math.add(math.multiply(lastPosition.velocity.angular.x, deltaTime), orientation[0]) as number;
                    const rY = math.add(math.multiply(lastPosition.velocity.angular.y, deltaTime), orientation[1]) as number;
                    const rZ = math.add(math.multiply(lastPosition.velocity.angular.z, deltaTime), orientation[2]) as number;
                    const rotMatrixZ = [
                        [1, 0, 0, 0],
                        [0, Math.cos(rZ), -Math.sin(rZ), 0],
                        [0, Math.sin(rZ), Math.cos(rZ), 0],
                        [0, 0, 0, 1]
                    ];
                    const rotMatrixY = [
                        [Math.cos(rY), 0, Math.sin(rY), 0],
                        [0, 1, 0, 0],
                        [-Math.sin(rY), 0, Math.cos(rY), 0],
                        [0, 0, 0, 1]
                    ];
                    const rotMatrixX = [
                        [Math.cos(rX), -Math.sin(rX), 0, 0],
                        [Math.sin(rX), Math.cos(rX), 0, 0],
                        [0, 0, 1, 0],
                        [0, 0, 0, 1]
                    ];
                    const rotationMatrix = math.multiply(math.multiply(rotMatrixX, rotMatrixY), rotMatrixZ);
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
