import { TimeService } from '../../service/TimeService';
import { LengthUnit } from '../../utils';
import { Matrix4 } from '../../utils/math/';
import { SerializableMember, SerializableObject, NumberType } from '../decorators';
import { Accuracy } from '../values/Accuracy';
import { Accuracy1D } from '../values/Accuracy1D';
import { Absolute3DPosition } from './Absolute3DPosition';
import { Orientation } from './Orientation';
import { Position } from './Position';

/**
 * Position and orientation.
 *
 * In computer vision and robotics, a typical task is to identify specific objects in an image and to determine each object's position and orientation relative to some coordinate system. This information can then be used, for example, to allow a robot to manipulate an object or to avoid moving into the object. The combination of position and orientation is referred to as the pose of an object, even though this concept is sometimes used only to describe the orientation. Exterior orientation and translation are also used as synonyms of pose.
 * @see {@link https://en.wikipedia.org/wiki/Pose_(computer_vision)}
 */
@SerializableObject()
export class Pose extends Matrix4 implements Position<LengthUnit> {
    /**
     * Position recording timestamp
     */
    @SerializableMember({
        index: true,
        numberType: NumberType.LONG,
    })
    timestamp: number = TimeService.now();
    /**
     * Position unit
     */
    @SerializableMember()
    unit: LengthUnit = LengthUnit.METER;
    @SerializableMember({
        name: 'accuracy',
    })
    private _accuracy: Accuracy<LengthUnit, any>;
    private _probability = 1.0;

    /**
     * Get the position probability
     * @returns {number} Probability between 0 and 1
     */
    @SerializableMember()
    get probability(): number {
        return this._probability;
    }

    set probability(value: number) {
        if (value > 1 || value < 0) {
            throw new Error(`${this.constructor.name} should be between 0 and 1.`);
        }
        this._probability = value;
    }

    /**
     * Position accuracy
     * @returns {Accuracy} Position accuracy
     */
    get accuracy(): Accuracy<LengthUnit, any> {
        if (!this._accuracy) {
            this._accuracy = new Accuracy1D(1, this.unit);
        }
        return this._accuracy;
    }

    set accuracy(value: Accuracy<LengthUnit, any>) {
        this._accuracy = value;
    }

    /**
     * Get a pose from a 4d matrix
     * @param {Matrix4} matrix 4x4 Matrix
     * @returns {Pose} Pose instance
     */
    static fromMatrix4<T extends Pose>(matrix: Matrix4): T {
        const pose = new this();
        pose.fromArray(matrix.toArray());
        return pose as T;
    }

    /**
     * Create a pose from a position
     * @param {Absolute3DPosition} position 3D position
     * @returns {Pose} Output pose
     */
    static fromPosition<T extends Pose>(position: Absolute3DPosition): T {
        const pose = new this();
        pose.timestamp = position.timestamp;
        pose.unit = position.unit;
        pose.probability = position.probability;
        pose.accuracy = pose.accuracy.clone();
        const vector = position.toVector3();
        if (position.orientation) {
            pose.makeRotationFromQuaternion(position.orientation);
        }
        pose.setPosition(vector.x, vector.y, vector.z);
        return pose as T;
    }

    /**
     * Extract the orientation from the pose
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
        position.probability = this.probability;
        position.accuracy = this.accuracy.clone();
        position.orientation = this.orientation;
        return position;
    }
}
