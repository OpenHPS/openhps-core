import { DataFrame, DataObject, AbsolutePosition } from "../../../data";
import * as math from 'mathjs';
import { ObjectProcessingNode } from "../../ObjectProcessingNode";
import { Quaternion, TimeUnit, Euler, Vector4 } from "../../../utils";
import { TimeService } from "../../../service";
import { Model } from "../../../Model";

/**
 * Linear and angular velocity processing
 */
export class VelocityProcessingNode<InOut extends DataFrame = DataFrame> extends ObjectProcessingNode<InOut> {

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            const model = (this.graph as Model);
            const timeService = model.findService(TimeService);

            if (object.getPosition() !== undefined) {
                const lastPosition = object.getPosition().clone<AbsolutePosition>();
                if (lastPosition.velocity !== undefined) {
                    // Time since current calculation and previous velocity
                    const deltaTime = timeService.getUnit().convert(timeService.getTime() - lastPosition.timestamp, TimeUnit.SECOND);
                    
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
                    newPosition.timestamp = timeService.getTime();
                    
                    const point = new Vector4().set(newPosition.toVector());

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
