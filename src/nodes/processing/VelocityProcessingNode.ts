import { DataFrame, DataObject, AbsolutePosition } from "../../data";
import * as math from 'mathjs';
import { ObjectProcessingNode } from "../ObjectProcessingNode";

/**
 * Linear and angular velocity processing
 */
export class VelocityProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            if (object.currentPosition !== undefined) {
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
                    // TODO: Validate delta time with the linear and angular velocity unit (meters per minute, second, ...)
                    const relativeMovement = math.multiply(lastPosition.velocity.linear.toVector(), deltaTime);
                    // Process the angular velocity


                    // Predict the next location
                    const newPosition = lastPosition;
                    newPosition.point = math.add(lastPosition.point, relativeMovement) as number[];

                    object.setCurrentPosition(newPosition);
                }
            }
            resolve(object);
        });
    }

}
