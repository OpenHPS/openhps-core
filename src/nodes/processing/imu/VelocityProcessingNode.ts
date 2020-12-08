import { DataFrame, DataObject } from '../../../data';
import { ObjectProcessingNode } from '../../ObjectProcessingNode';
import { TimeUnit, LengthUnit } from '../../../utils';
import { TimeService } from '../../../service';
import { Matrix4, Vector3, Quaternion, AxisAngle } from '../../../utils/math';

/**
 * Linear and angular velocity processing
 */
export class VelocityProcessingNode<InOut extends DataFrame> extends ObjectProcessingNode<InOut> {
    public processObject(object: DataObject, frame: InOut): Promise<DataObject> {
        return new Promise<DataObject>((resolve) => {
            if (object.getPosition() !== undefined) {
                const lastPosition = object.getPosition();
                if (lastPosition.velocity !== undefined) {
                    // Time since current calculation and previous velocity
                    const deltaTime = TimeService.getUnit().convert(
                        frame.createdTimestamp - lastPosition.timestamp,
                        TimeUnit.SECOND,
                    );

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
                        relativePosition.applyMatrix4(
                            new Matrix4().makeTranslation(linearMovement.x, linearMovement.y, linearMovement.z),
                        );
                    } else if (!linear.equals(Vector3.fromArray([0, 0, 0]))) {
                        // Apply linear and angular velocity
                        const rX = linear.clone().divideScalar(angular.x === 0 ? 1 : angular.x);
                        const rY = linear.clone().divideScalar(angular.y === 0 ? 1 : angular.y);
                        const rZ = linear.clone().divideScalar(angular.z === 0 ? 1 : angular.z);
                        const rMin = rX.min(rY).min(rZ); // Rotation point
                        relativePosition.applyMatrix4(new Matrix4().makeTranslation(-rMin.x, -rMin.y, -rMin.z));
                        relativePosition.applyMatrix4(
                            new AxisAngle(angularMovement.x, angularMovement.y, angularMovement.z).toRotationMatrix(),
                        );
                        relativePosition.applyMatrix4(new Matrix4().makeTranslation(rMin.x, rMin.y, rMin.z));
                        relativePosition.applyMatrix4(
                            Matrix4.rotationFromAxisAngle(
                                new Vector3(angular.x !== 0 ? 1 : 0, angular.y !== 0 ? 1 : 0, angular.z !== 0 ? 1 : 0),
                                Math.PI / 2,
                            ),
                        );
                    }

                    // Predict the next location
                    const newPosition = lastPosition.clone();
                    if (!newPosition.orientation) {
                        newPosition.orientation = new Quaternion();
                    }
                    newPosition.timestamp = frame.createdTimestamp;
                    newPosition.fromVector(
                        newPosition
                            .toVector3(LengthUnit.METER)
                            .add(relativePosition.applyMatrix4(newPosition.orientation.toRotationMatrix())),
                        LengthUnit.METER,
                    );

                    // New orientation in radians
                    const newOrientation = newPosition.orientation
                        .toEuler()
                        .toVector3()
                        .add(lastPosition.velocity.angular.clone().multiplyScalar(deltaTime));
                    newPosition.orientation = Quaternion.fromEuler(newOrientation);
                    object.setPosition(newPosition);
                }
            }
            resolve(object);
        });
    }
}
