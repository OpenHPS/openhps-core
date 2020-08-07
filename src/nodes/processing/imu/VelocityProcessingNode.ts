import { DataFrame, DataObject, AbsolutePosition } from "../../../data";
import { ObjectProcessingNode } from "../../ObjectProcessingNode";
import { TimeUnit } from "../../../utils";
import { TimeService } from "../../../service";
import { Model } from "../../../Model";
import { Vector4, Matrix4, Vector3, Quaternion } from "../../../utils/math";

/**
 * Linear and angular velocity processing
 */
export class VelocityProcessingNode<InOut extends DataFrame = DataFrame> extends ObjectProcessingNode<InOut> {

    public processObject(object: DataObject): Promise<DataObject> {
        return new Promise<DataObject>((resolve, reject) => {
            const model = (this.graph as Model);
            const timeService = model.findService(TimeService);

            if (object.getPosition() !== undefined) {
                const lastPosition = object.getPosition().clone();
                if (lastPosition.velocity !== undefined) {
                    // Time since current calculation and previous velocity
                    const deltaTime = timeService.getUnit().convert(timeService.getTime() - lastPosition.timestamp, TimeUnit.SECOND);
                    
                    if (deltaTime < 0) {
                        // Delta time is negative, this means the previous location
                        // timestamp was incorrect
                        return resolve(object);
                    }

                    // Process the linear velocity
                    const linear = lastPosition.velocity.linear.clone().multiplyScalar(deltaTime);
                    const rotation = lastPosition.velocity.angular.clone().multiplyScalar(deltaTime);
                    
                    // Relative position starts at the origin
                    // We will rotate this final relative position using the orientation
                    // and add it to the existing position vector of our last known position
                    const relativePosition = Vector3.fromArray([0, 0, 0]);

                    if (rotation.equals(Vector3.fromArray([0, 0, 0]))) {
                        // Simply apply the linear velocity
                        relativePosition.applyMatrix4(new Matrix4().makeTranslation(linear.x, linear.y, linear.z));
                    } else {
                        // Apply linear and angular velocity
                        const rX = linear.clone().divideScalar(rotation.x === 0 ? 1 : Math.abs(rotation.x));
                        const rY = linear.clone().divideScalar(rotation.y === 0 ? 1 : Math.abs(rotation.y));
                        const rZ = linear.clone().divideScalar(rotation.z === 0 ? 1 : Math.abs(rotation.z));
                        const rMin = rX.min(rY).min(rZ);
                        relativePosition.applyMatrix4(new Matrix4().makeTranslation(-rMin.x, -rMin.y, -rMin.z));
                        relativePosition.applyMatrix4(Quaternion.fromEuler(rotation.clone()).toRotationMatrix());
                        relativePosition.negate();
                        relativePosition.z = -relativePosition.z;
                        relativePosition.applyMatrix4(new Matrix4().makeTranslation(rMin.x, rMin.y, rMin.z));
                    }
                    
                    // Predict the next location
                    const newPosition = lastPosition;
                    newPosition.timestamp = timeService.getTime();
                    newPosition.fromVector(newPosition.toVector3().add(relativePosition.applyMatrix4(lastPosition.orientation.toRotationMatrix())));

                    // New orientation in radians
                    const newOrientation = lastPosition.orientation.toEuler().toVector3().add(lastPosition.velocity.angular.clone().multiplyScalar(deltaTime));
                    newPosition.orientation = Quaternion.fromEuler(newOrientation);
                    object.setPosition(newPosition);
                }
            }
            resolve(object);
        });
    }

}
