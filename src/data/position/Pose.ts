import { TimeService } from '../../service/TimeService';
import { LengthUnit } from '../../utils';
import { Matrix4 } from '../../utils/math/';
import { SerializableMember, SerializableObject } from '../decorators';
import { Absolute3DPosition } from './Absolute3DPosition';
import { Orientation } from './Orientation';
import { Position } from './Position';

/**
 * Position and orientation
 */
@SerializableObject()
export class Pose extends Matrix4 implements Position {
    /**
     * Position recording timestamp
     */
    @SerializableMember({
        index: true,
    })
    timestamp: number = TimeService.now();
    /**
     * Position unit
     */
    @SerializableMember()
    unit: LengthUnit = LengthUnit.METER;

    /**
     * Get a pose from a 4d matrix
     *
     * @param {Matrix4} matrix 4x4 Matrix
     * @returns {Pose} Pose instance
     */
    static fromMatrix4<T extends Pose>(matrix: Matrix4): T {
        const pose = new this();
        pose.fromArray(matrix.toArray());
        return pose as T;
    }

    static fromPosition<T extends Pose>(position: Absolute3DPosition, orientation: Orientation): T {
        const pose = new this();
        pose.timestamp = position.timestamp;
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
        orientation.timestamp = this.timestamp;
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
        position.timestamp = this.timestamp;
        position.unit = this.unit;
        position.orientation = this.orientation;
        return position;
    }
}
