import { DataFrame, DataObject, AbsolutePosition, ReferenceSpace } from "../../data";
import * as math from 'mathjs';
import { ObjectProcessingNode } from "../ObjectProcessingNode";

/**
 * Linear and angular velocity processing
 */
export class VelocityProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (object.getCurrentPosition() !== undefined) {
                const lastPosition = object.getCurrentPosition().clone<AbsolutePosition>();
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
                    const translationMatrix = [
                        [1, 0, 0, 0],
                        [0, 1, 0, 0],
                        [0, 0, 1, 0],
                        [dX, dY, dZ, 1]
                    ];
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
                    const rotationMatrix = math.multiply(math.multiply(rotMatrixX, rotMatrixY), rotMatrixZ);
                    const transformationMatrix = math.multiply(translationMatrix, rotationMatrix);
                    const relativePosition = math.multiply([0, 0, 0, 1], transformationMatrix);

                    // Predict the next location
                    const newPosition = lastPosition;
                    const point = newPosition.point;
                    // TODO: Cleanup
                    if (point.length === 3) {
                        point.push(1);
                    } else {
                        point.push(0, 1);
                    }
                    newPosition.point = math.add(point, relativePosition) as number[];
                    object.setCurrentPosition(newPosition);
                }
            }
            resolve(object);
        });
    }

}
