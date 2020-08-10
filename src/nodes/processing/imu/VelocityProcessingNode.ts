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
                const lastPosition = object.getPosition();
                if (lastPosition.velocity !== undefined) {
                    // Time since current calculation and previous velocity
                    const deltaTime = timeService.getUnit().convert(timeService.getTime() - lastPosition.timestamp, TimeUnit.SECOND);
                    
                    if (deltaTime < 0) {
                        // Delta time is negative, this means the previous location
                        // timestamp was incorrect
                        return resolve(object);
                    }

                    const linear = lastPosition.velocity.linear;
                    const angular = lastPosition.velocity.angular;
                    const linearMovement = linear.clone().multiplyScalar(deltaTime);
                    const angularMovement = angular.clone().multiplyScalar(deltaTime);
                    
                    // Relative position starts at the origin
                    // We will rotate this final relative position using the orientation
                    // and add it to the existing position vector of our last known position
                    const relativePosition = Vector3.fromArray([0, 0, 0]);

                    if (angular.equals(Vector3.fromArray([0, 0, 0]))) {
                        // Simply apply the linear velocity
                        relativePosition.applyMatrix4(new Matrix4().makeTranslation(linearMovement.x, linearMovement.y, linearMovement.z));
                    } else if (!linear.equals(Vector3.fromArray([0, 0, 0]))) {
                        // Apply linear and angular velocity
                        const rX = linear.clone().divideScalar(angular.x === 0 ? 1 : angular.x);
                        const rY = linear.clone().divideScalar(angular.y === 0 ? 1 : angular.y);
                        const rZ = linear.clone().divideScalar(angular.z === 0 ? 1 : angular.z);
                        const rMin = rX.min(rY).min(rZ); // Rotation point
                        const offset = new Vector3(
                            linear.x === 0 ? 0 : rMin.x / linear.x,
                            linear.y === 0 ? 0 : rMin.y / linear.y,
                            linear.z === 0 ? 0 : rMin.z / linear.z
                        ).multiply(linearMovement);
                        relativePosition.applyMatrix4(new Matrix4().makeTranslation(-offset.x, -offset.y, -offset.z));
                        relativePosition.applyMatrix4(Quaternion.fromEuler(angularMovement).toRotationMatrix());
                        relativePosition.applyMatrix4(new Matrix4().makeTranslation(offset.x, offset.y, offset.z));
                        relativePosition.applyMatrix4(Quaternion.fromEuler([
                            angular.x !== 0 ? Math.PI / 2 : 0, 
                            angular.y !== 0 ? Math.PI / 2 : 0, 
                            angular.z !== 0 ? Math.PI / 2 : 0
                        ]).toRotationMatrix());
                        relativePosition.z = -relativePosition.z;
                    }
                    
                    // Predict the next location
                    const newPosition = lastPosition.clone();
                    newPosition.timestamp = timeService.getTime();
                    newPosition.fromVector(newPosition.toVector3().add(relativePosition.applyMatrix4(lastPosition.orientation.toRotationMatrix())));

                    // New orientation in radians
                    const newOrientation = newPosition.orientation.toEuler().toVector3().add(lastPosition.velocity.angular.clone().multiplyScalar(deltaTime));
                    newPosition.orientation = Quaternion.fromEuler(newOrientation);
                    object.setPosition(newPosition);
                }
            }
            resolve(object);
        });
    }

}
