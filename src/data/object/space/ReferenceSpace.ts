import { DataObject } from '../DataObject';
import { SerializableObject, SerializableMember } from '../../decorators';
import { Matrix4, Euler, Quaternion, AxisAngle, EulerOrder, Vector3 } from '../../../utils/math';
import { AngleUnit, LengthUnit } from '../../../utils';
import { AbsolutePosition } from '../../position/AbsolutePosition';
import { TransformationSpace, SpaceTransformationOptions } from './TransformationSpace';
import { DataService } from '../../../service/DataService';

/**
 * A reference space transforms absolute positions to another (global) reference space.
 * The following data can be transformed:
 * - Position coordinates
 * - Linear velocity
 * - Angular velocity
 * - Orientation
 * - Position accuracy
 */
@SerializableObject()
export class ReferenceSpace extends DataObject implements TransformationSpace {
    @SerializableMember({
        name: 'translationMatrix',
    })
    private _translationMatrix: Matrix4;
    // Raw transformation matrix
    @SerializableMember({
        name: 'transformationMatrix',
    })
    private _transformationMatrix: Matrix4;
    // Scale matrix (needed for scaling linear velocity)
    @SerializableMember({
        name: 'scaleMatrix',
    })
    private _scaleMatrix: Matrix4;
    // Rotation matrix (needed for orientation, angular velocity and linear velocity)
    @SerializableMember({
        name: 'rotation',
    })
    private _rotation: Quaternion;
    @SerializableMember({
        name: 'unit',
    })
    private _unit: LengthUnit;
    private _parent: TransformationSpace;

    constructor(parent?: TransformationSpace) {
        super();
        this.parent = parent;

        this._scaleMatrix = new Matrix4();
        this._transformationMatrix = new Matrix4().identity();
        this._translationMatrix = new Matrix4().identity();
        this._rotation = new Quaternion();
    }

    /**
     * Create a reference space from another object
     * @param {DataObject} object Reference space
     */
    static fromDataObject(object: DataObject): ReferenceSpace {
        const space = new ReferenceSpace();
        space.uid = object.uid;
        space.displayName = object.displayName;
        if (object.getPosition()) {
            space.translation(...object.getPosition().toVector3(LengthUnit.METER).toArray());
            if (object.getPosition().orientation) {
                space.rotation(object.getPosition().orientation);
            }
        }
        return space;
    }

    /**
     * Set the parent space
     * @param {TransformationSpace} space Parent space
     */
    set parent(space: TransformationSpace) {
        if (!space) {
            return;
        } else {
            this.parentUID = space.uid;
            this._parent = space;
        }
    }

    /**
     * Get the parent space if loaded
     * @returns {TransformationSpace | undefined} Transformation space or undefined
     */
    get parent(): TransformationSpace {
        return this._parent;
    }

    /**
     * Update parent reference spaces
     * @param {DataService} service Service to use for updating
     * @returns {Promise<void>} Update promise
     */
    public update(service: DataService<string, this>): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.parentUID) {
                // Update parent
                service
                    .findByUID(this.parentUID)
                    .then((parent) => {
                        this._parent = parent;
                        if (!parent) {
                            throw new Error(`Unable to find reference space with uid: ${this.parentUID}!`);
                        }
                        return this._parent.update(service);
                    })
                    .then(resolve)
                    .catch(reject);
            } else {
                resolve();
            }
        });
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
     * @param {number} left Farthest left on the x-axis
     * @param {number} right Farthest right on the x-axis
     * @param {number} bottom Farthest down on the y-axis
     * @param {number} top Farthest up on the y-axis
     * @param {number} near Distance to the near clipping plane along the -Z axis
     * @param {number} far Distance to the far clipping plane along the -Z axis
     * @returns {ReferenceSpace} Reference space instance
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

    public reset(): ReferenceSpace {
        this._transformationMatrix.identity();
        this._scaleMatrix = new Matrix4();
        this._rotation = new Quaternion();
        return this;
    }

    public referenceUnit(unit: LengthUnit): ReferenceSpace {
        this._unit = unit;
        return this;
    }

    public translation(dX: number, dY: number, dZ = 0): ReferenceSpace {
        this._translationMatrix.multiply(new Matrix4().makeTranslation(dX, dY, dZ));
        this._transformationMatrix.multiply(this._translationMatrix);
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

    /**
     * Transform a position
     * @param {AbsolutePosition} position Position to transform
     * @param {SpaceTransformationOptions} [options] Transformation options
     * @returns {AbsolutePosition} Transformed position
     */
    public transform<In extends AbsolutePosition, Out extends AbsolutePosition = In>(
        position: In,
        options?: SpaceTransformationOptions,
    ): Out {
        const config = options || {};
        // Clone the position
        const newPosition = this._parent ? this._parent.transform(position, options) : position.clone();
        // Transform the position to the length unit
        if (this._unit) {
            newPosition.fromVector(newPosition.toVector3(this._unit));
            newPosition.setAccuracy(newPosition.accuracy.to(this._unit));
        }

        const transformationMatrix = config.inverse
            ? this.transformationMatrix.clone().invert()
            : this.transformationMatrix;
        const rotation = config.inverse ? this.rotationQuaternion.clone().invert() : this.rotationQuaternion;
        const scale = config.inverse ? this._scaleMatrix.clone().invert() : this.scaleMatrix;

        // Transform the point using the transformation matrix
        newPosition.fromVector(newPosition.toVector3().applyMatrix4(transformationMatrix));
        // Transform the orientation (rotation)
        if (newPosition.orientation) {
            // Rotate the quaterion
            newPosition.orientation.multiply(rotation);
        }
        if (newPosition.linearVelocity) {
            // Transform the linear velocity (rotation and scale)
            newPosition.linearVelocity.applyMatrix4(scale).applyMatrix4(Matrix4.rotationFromQuaternion(rotation));
        }
        newPosition.setAccuracy(
            new Vector3(newPosition.accuracy.valueOf(), 0, 0).applyMatrix4(scale).x,
            newPosition.accuracy.unit,
        );

        newPosition.referenceSpaceUID = this.uid;
        return newPosition as unknown as Out;
    }

    get transformationMatrix(): Matrix4 {
        return this._transformationMatrix;
    }

    protected set transformationMatrix(matrix: Matrix4) {
        this._transformationMatrix = matrix;
    }

    /**
     * Get the transformation matrix for scaling
     * @returns {Matrix4} Transformation matrix
     */
    public get scaleMatrix(): Matrix4 {
        return this._scaleMatrix;
    }

    protected set scaleMatrix(matrix: Matrix4) {
        this._scaleMatrix = matrix;
    }

    public get rotationQuaternion(): Quaternion {
        return this._rotation;
    }

    protected set rotationQuaternion(quaternion: Quaternion) {
        this._rotation = quaternion;
    }

    public get translationMatrix(): Matrix4 {
        return this._translationMatrix;
    }

    protected set translationMatrix(matrix: Matrix4) {
        this._translationMatrix = matrix;
    }
}
