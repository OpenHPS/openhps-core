import { DataObject } from "../DataObject";
import { Space } from "./Space";
import { SerializableObject, SerializableMember } from "../../decorators";
import { Matrix4, Euler, Quaternion, AxisAngle, Vector3, EulerOrder } from '../../../utils/math';
import { AngleUnit } from "../../../utils";

@SerializableObject()
export class ReferenceSpace extends DataObject implements Space {
    // Raw transformation matrix
    @SerializableMember()
    private _transformationMatrix: Matrix4 = new Matrix4().identity() as Matrix4;
    @SerializableMember()
    private _rotationMatrix: Matrix4 = new Matrix4().identity() as Matrix4;
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

    /**
     * Get the transformation matrix from this reference space to the relative space
     */
    public get transformationMatrix(): Matrix4 {
        return this._transformationMatrix;
    }

    public get rotationMatrix(): Matrix4 {
        return this._rotationMatrix;
    }

    public orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): ReferenceSpace {
        this._transformationMatrix.multiply(new Matrix4().makeOrthographic(left, right, bottom, top, near, far));
        return this;
    }

    public perspective(left: number, right: number, bottom: number, top: number, near: number, far: number): ReferenceSpace {
        this._transformationMatrix.multiply(new Matrix4().makePerspective(left, right, bottom, top, near, far));
        return this;
    }

    public translation(dX: number, dY: number, dZ: number = 0): ReferenceSpace {
        this._transformationMatrix.multiply(new Matrix4().makeTranslation(dX, dY, dZ));
        return this;
    }

    public scale(kX: number, kY: number, kZ: number = 1.0): ReferenceSpace {
        this._transformationMatrix.multiply(new Matrix4().makeScale(kX, kY, kZ));
        return this;
    }

    public rotation(r: Quaternion): ReferenceSpace;
    public rotation(r: Euler): ReferenceSpace;
    public rotation(r: AxisAngle): ReferenceSpace;
    public rotation(r: { yaw: number, pitch: number, roll: number, unit?: AngleUnit }): ReferenceSpace;
    public rotation(r: { x: number, y: number, z: number, order?: EulerOrder, unit?: AngleUnit }): ReferenceSpace;
    public rotation(r: number[]): ReferenceSpace;
    public rotation(r: any): ReferenceSpace {
        if (r instanceof Quaternion) {
            this._rotationMatrix = new Matrix4().makeRotationFromQuaternion(r);
            this._transformationMatrix.multiply(this._rotationMatrix);
        } else if (r instanceof Euler) {
            this._rotationMatrix = new Matrix4().makeRotationFromEuler(r);
            this._transformationMatrix.multiply(this._rotationMatrix);
        } else if (r instanceof AxisAngle) {
            this._rotationMatrix = new Matrix4().makeRotationAxis(new Vector3(r.x, r.y, r.z), r.angle);
            this._transformationMatrix.multiply(this._rotationMatrix);
        } else {
            this._rotationMatrix = Quaternion.fromEuler(r).toRotationMatrix();
            this._transformationMatrix.multiply(this._rotationMatrix);
        }
        return this;
    }

}
