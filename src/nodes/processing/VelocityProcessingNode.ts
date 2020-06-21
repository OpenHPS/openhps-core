import { DataFrame } from "../../data";
import { Node } from "../../Node";
import * as math from '../../utils/_internal/Math';

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
                        // Process velocity
                        const deltaTime = new Date().getTime() - object.currentLocation.timestamp;
                        const relativeMovement = math.multiply(object.currentLocation.velocity.linearVelocity, deltaTime);
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
