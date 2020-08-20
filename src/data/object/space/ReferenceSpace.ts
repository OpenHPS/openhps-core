import { DataObject } from '../DataObject';
import { Space } from './Space';
import { SerializableObject, SerializableMember } from '../../decorators';
import { Matrix4, Euler, Quaternion, AxisAngle, EulerOrder } from '../../../utils/math';
import { AngleUnit } from '../../../utils';
import { AbsolutePosition } from '../../position/AbsolutePosition';

@SerializableObject()
export class ReferenceSpace extends DataObject implements Space {
    // Raw transformation matrix
    @SerializableMember()
    private _transformationMatrix = new Matrix4().identity() as Matrix4;
    // Scale matrix (needed for scaling linear velocity)
    @SerializableMember()
    private _scaleMatrix = new Matrix4().identity() as Matrix4;
    // Rotation matrix (needed for orientation, angular velocity and linear velocity)
    @SerializableMember()
    private _rotation = new Quaternion();
    @SerializableMember()
    private _baseSpaceUID: string;

    constructor(baseSpace?: ReferenceSpace, transformationMatrix?: Matrix4) {
        super();
        if (baseSpace) {
            this._baseSpaceUID = baseSpace.uid;
        }

        if (transformationMatrix === undefined) {
            this._transformationMatrix.identity();
        } else {
            this._transformationMatrix = transformationMatrix;
        }
    }

    public get baseSpaceUID(): string {
        return this._baseSpaceUID;
    }

    public get scaleMatrix(): Matrix4 {
        return this._scaleMatrix;
    }

    public orthographic(
        left: number,
        right: number,
        bottom: number,
        top: number,
        near: number,
        far: number,
    ): ReferenceSpace {
        this._transformationMatrix.multiply(new Matrix4().makeOrthographic(left, right, bottom, top, near, far));
        return this;
    }

    /**
     * Transform perspective
     *
     * @param left   Number Farthest left on the x-axis
     * @param right  Number Farthest right on the x-axis
     * @param bottom Number Farthest down on the y-axis
     * @param top    Number Farthest up on the y-axis
     * @param near   Number Distance to the near clipping plane along the -Z axis
     * @param far    Number Distance to the far clipping plane along the -Z axis
     */
    public perspective(
        left: number,
        right: number,
        bottom: number,
        top: number,
        near: number,
        far: number,
    ): ReferenceSpace {
        this._transformationMatrix.multiply(new Matrix4().makePerspective(left, right, bottom, top, near, far));
        return this;
    }

    public translation(dX: number, dY: number, dZ = 0): ReferenceSpace {
        this._transformationMatrix.multiply(new Matrix4().makeTranslation(dX, dY, dZ));
        return this;
    }

    public scale(kX: number, kY: number, kZ = 1.0): ReferenceSpace {
        this._scaleMatrix = new Matrix4().makeScale(kX, kY, kZ);
        this._transformationMatrix.multiply(this._scaleMatrix);
        return this;
    }

    public rotation(r: Quaternion): ReferenceSpace;
    public rotation(r: Euler): ReferenceSpace;
    public rotation(r: AxisAngle): ReferenceSpace;
    public rotation(r: { yaw: number; pitch: number; roll: number; unit?: AngleUnit }): ReferenceSpace;
    public rotation(r: { x: number; y: number; z: number; order?: EulerOrder; unit?: AngleUnit }): ReferenceSpace;
    public rotation(r: number[]): ReferenceSpace;
    public rotation(r: any): ReferenceSpace {
        if (r instanceof Quaternion) {
            this._rotation = r.clone();
            this._transformationMatrix.multiply(this._rotation.toRotationMatrix());
        } else if (r instanceof Euler) {
            this._rotation = Quaternion.fromEuler(r);
            this._transformationMatrix.multiply(this._rotation.toRotationMatrix());
        } else if (r instanceof AxisAngle) {
            this._rotation = Quaternion.fromAxisAngle(r);
            this._transformationMatrix.multiply(this._rotation.toRotationMatrix());
        } else {
            this._rotation = Quaternion.fromEuler(r);
            this._transformationMatrix.multiply(this._rotation.toRotationMatrix());
        }
        return this;
    }

    public transform(position: AbsolutePosition, inverse = false): AbsolutePosition {
        const transformedPosition = position.clone();

        const transformationMatrix = inverse
            ? new Matrix4().getInverse(this._transformationMatrix)
            : this._transformationMatrix;
        const rotation = inverse ? this._rotation.clone().inverse() : this._rotation;
        const scale = inverse ? new Matrix4().getInverse(this._scaleMatrix) : this._scaleMatrix;

        // Transform the point using the transformation matrix
        transformedPosition.fromVector(transformedPosition.toVector3().applyMatrix4(transformationMatrix));
        // Transform the orientation (rotation)
        if (transformedPosition.orientation) {
            transformedPosition.orientation.multiply(rotation);
        }
        if (transformedPosition.velocity) {
            // Transform the linear velocity (rotation and scale)
            transformedPosition.velocity.linear
                .applyMatrix4(scale)
                .applyMatrix4(Matrix4.rotationFromQuaternion(rotation));
            // TODO: Transform the angular velocity (rotation axis)
        }

        transformedPosition.referenceSpaceUID = this.uid;
        return transformedPosition;
    }
}
