import { DataFrame } from "../../data";
import { Node } from "../../Node";
import * as math from '../../utils/_internal/Math';

/**
 * Linear and angular velocity processing
 */
export class VelocityProcessingNode<InOut extends DataFrame> extends Node<any, InOut> {

    constructor() {
        super();

        this.on('push', this._onPush.bind(this));
    }

    private _onPush(frame: InOut): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            frame.getObjects().forEach(object => {
                if (object.currentLocation !== undefined) {
                    if (object.currentLocation.velocity !== undefined) {
                        // Time since current calculation and previous velocity
                        const deltaTime = new Date().getTime() - object.currentLocation.timestamp;

                        if (deltaTime < 0) {
                            // Delta time is negative, this means the previous location
                            // timestamp was incorrect
                            return resolve();
                        }

                        // Process the linear velocity
                        // TODO: Validate delta time with the linear and angular velocity unit (meters per minute, second, ...)
                        let relativeMovement = math.multiply(object.currentLocation.velocity.linearVelocity, deltaTime);
                        // Process the angular velocity


                        // Predict the next location
                        const predictedLocation = object.currentLocation;
                        predictedLocation.point = math.add(object.currentLocation.point, relativeMovement) as number[];

                        object.addPredictedLocation(predictedLocation);
                    }
                }
            });
            resolve();
        });
    }

}
