import { DataFrame, DataObject, AbsolutePosition } from "../../../data";
import * as math from 'mathjs';
import { ObjectProcessingNode } from "../../ObjectProcessingNode";
import { Quaternion } from "../../../utils";

/**
 * Linear and angular velocity processing
 */
export class VelocityProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (object.getPosition() !== undefined) {
                const lastPosition = object.getPosition().clone<AbsolutePosition>();
                if (lastPosition.velocity !== undefined) {
                    // Time since current calculation and previous velocity
                    const deltaTime = new Date().getTime() - lastPosition.timestamp;

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
                    ], deltaTime / 1000.);
                    
                    // Process the angular velocity
                    const rX = lastPosition.velocity.angular.x;
                    const rY = lastPosition.velocity.angular.y;
                    const rZ = lastPosition.velocity.angular.z;
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
                    const rotationMatrix = math.multiply(math.multiply(math.multiply(rotMatrixX, rotMatrixY), rotMatrixZ), deltaTime / 1000.);
                    const transformationMatrix = math.multiply(translationMatrix, rotationMatrix);
                    // The relative position is the transformation matrix rotated using the orientation
                    const relativePosition = math.multiply(math.multiply([0, 0, 0, 1], transformationMatrix), lastPosition.orientation.toRotationMatrix());
                    const relativeOrientation = math.multiply([rX, rY, rZ], deltaTime / 1000.);
 
                    // Predict the next location
                    const newPosition = lastPosition;
                    const point = newPosition.toVector();
                    if (point.length === 3) {
                        point.push(1);
                    } else {
                        point.push(0, 1);
                    }
                    // New orientation in radians
                    const newOrientation = math.add(lastPosition.orientation.toEuler(), relativeOrientation) as number[];
                    newPosition.orientation = Quaternion.fromEuler({ x: newOrientation[0], y: newOrientation[1], z: newOrientation[2] });
                    newPosition.fromVector(math.add(point, relativePosition) as number[]);
                    object.setPosition(newPosition);
                }
            }
            resolve(object);
        });
    }

}
