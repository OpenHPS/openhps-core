import { TimeService } from '../../service/TimeService';
import { LengthUnit } from '../../utils';
import { Matrix4 } from '../../utils/math/';
import { SerializableMember, SerializableObject } from '../decorators';
import { Absolute3DPosition } from './Absolute3DPosition';
import { Orientation } from './Orientation';

/**
 * Position and orientation
 */
@SerializableObject()
export class Pose extends Matrix4 {
    /**
     * Position recording timestamp
     */
    @SerializableMember({
        index: true,
    })
    positionTimestamp: number = TimeService.now();
    /**
     * Position recording timestamp
     */
    @SerializableMember({
        index: true,
    })
    orientationTimestamp: number = TimeService.now();
    /**
     * Position unit
     */
    @SerializableMember()
    unit: LengthUnit = LengthUnit.METER;

    static fromMatrix4<T extends Pose>(matrix: Matrix4): T {
        const pose = new this();
        pose.fromArray(matrix.toArray());
        return pose as T;
    }

    static fromPosition<T extends Pose>(position: Absolute3DPosition, orientation: Orientation): T {
        const pose = new this();
        pose.positionTimestamp = position.timestamp;
        pose.orientationTimestamp = orientation.timestamp;
        pose.unit = position.unit;
        const vector = position.toVector3();
        pose.makeRotationFromQuaternion(orientation);
        pose.setPosition(vector.x, vector.y, vector.z);
        return pose as T;
    }

    /**
     * Extract the orientation from the pose
     *
     * @returns {Orientation} Orientation
     */
    get orientation(): Orientation {
        const rotationMatrix = this.extractRotation(this);
        const orientation = Orientation.fromRotationMatrix(rotationMatrix) as Orientation;
        orientation.timestamp = this.orientationTimestamp;
        return orientation;
    }

    /**
     * Extract the 3d position from the pose
     *
     * @returns {Absolute3DPosition} 3D position
     */
    get position(): Absolute3DPosition {
        const positionMatrix = this.copyPosition(this);
        const position = new Absolute3DPosition(
            positionMatrix.elements[12],
            positionMatrix.elements[13],
            positionMatrix.elements[14],
        );
        position.timestamp = this.positionTimestamp;
        position.unit = this.unit;
        return position;
    }
}
