import { DataFrame, DataObject, AbsolutePosition, EulerOrientation } from "../../data";
import * as math from 'mathjs';
import { ObjectProcessingNode } from "../ObjectProcessingNode";
import { AngularVelocityUnit, LinearVelocityUnit, AngleUnit } from "../../utils";

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
                    const dX = lastPosition.velocity.linear.unit.convert(lastPosition.velocity.linear.x, LinearVelocityUnit.METERS_PER_SECOND);
                    const dY = lastPosition.velocity.linear.unit.convert(lastPosition.velocity.linear.y, LinearVelocityUnit.METERS_PER_SECOND);
                    const dZ = lastPosition.velocity.linear.unit.convert(lastPosition.velocity.linear.z, LinearVelocityUnit.METERS_PER_SECOND);
                    const translationMatrix = math.multiply([
                        [1, 0, 0, 0],
                        [0, 1, 0, 0],
                        [0, 0, 1, 0],
                        [dX, dY, dZ, 1]
                    ], deltaTime / 1000.);
                    
                    // Process the angular velocity
                    const rX = lastPosition.velocity.angular.unit.convert(lastPosition.velocity.angular.x, AngularVelocityUnit.RADIANS_PER_SECOND);
                    const rY = lastPosition.velocity.angular.unit.convert(lastPosition.velocity.angular.y, AngularVelocityUnit.RADIANS_PER_SECOND);
                    const rZ = lastPosition.velocity.angular.unit.convert(lastPosition.velocity.angular.z, AngularVelocityUnit.RADIANS_PER_SECOND);
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
                    const newOrientation = math.add(newPosition.orientation.toVector(AngleUnit.RADIANS), relativeOrientation) as number[];
                    newOrientation[0] = AngleUnit.RADIANS.convert(newOrientation[0], newPosition.orientation.unit);
                    newOrientation[1] = AngleUnit.RADIANS.convert(newOrientation[1], newPosition.orientation.unit);
                    newOrientation[2] = AngleUnit.RADIANS.convert(newOrientation[2], newPosition.orientation.unit);
                    newPosition.orientation = EulerOrientation.fromVector(newOrientation, newPosition.orientation.unit);
                    newPosition.fromVector(math.add(point, relativePosition) as number[]);
                    object.setPosition(newPosition);
                }
            }
            resolve(object);
        });
    }

}
