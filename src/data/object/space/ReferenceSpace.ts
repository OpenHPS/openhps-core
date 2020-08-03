import { DataObject } from "../DataObject";
import * as math from 'mathjs';
import { AngleUnit, Quaternion, AxisAngle, Euler, EulerOrder, Vector4 } from "../../../utils";
import { Space } from "./Space";
import { SerializableObject, SerializableArrayMember, SerializableMember } from "../../decorators";

@SerializableObject()
export class ReferenceSpace extends DataObject implements Space {
    // Raw transformation matrix
    @SerializableArrayMember(Number, { dimensions: 2 })
    private _transformationMatrix: number[][];
    @SerializableArrayMember(Number, { dimensions: 2 })
    private _scaleMatrix: number[][];
    @SerializableArrayMember(Number, { dimensions: 2 })
    private _translationMatrix: number[][];
    @SerializableArrayMember(Number, { dimensions: 2 })
    private _rotationMatrix: number[][];
    @SerializableMember()
    private _baseSpaceUID: string;

    // TODO: Move identity matrix to some matrix dedicated class or mathjs
    private static _identity = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];

    constructor(baseSpace?: ReferenceSpace, transformationMatrix?: number[][]) {
        super();
        if (baseSpace) {
            this._baseSpaceUID = baseSpace.uid;
        }
        
        this._transformationMatrix = transformationMatrix;
        this._scaleMatrix = Array.from(ReferenceSpace._identity);
        this._translationMatrix = Array.from(ReferenceSpace._identity);
        this._rotationMatrix = Array.from(ReferenceSpace._identity);

        if (this._transformationMatrix === undefined) {
            // Initialize
            this._calculateTransformationMatrix();
        }
    }

    public get baseSpaceUID(): string {
        return this._baseSpaceUID;
    }

    public translate(dX: number, dY: number, dZ: number = 0): ReferenceSpace {
        this._translationMatrix = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [dX, dY, dZ, 1]
        ];
        this._calculateTransformationMatrix();
        return this;
    }

    public scale(kX: number, kY: number, kZ: number = 1.0): ReferenceSpace {
        this._scaleMatrix = [
            [kX, 0, 0, 0],
            [0, kY, 0, 0],
            [0, 0, kZ, 0],
            [0, 0, 0, 1]
        ];
        this._calculateTransformationMatrix();
        return this;
    }

    public rotate(r: { yaw: number, pitch: number, roll: number, unit?: AngleUnit }): ReferenceSpace;
    public rotate(r: { x: number, y: number, z: number, order?: EulerOrder, unit?: AngleUnit }): ReferenceSpace;
    public rotate(r: number[]): ReferenceSpace;
    public rotate(r: Quaternion): ReferenceSpace;
    public rotate(r: Euler): ReferenceSpace;
    public rotate(r: AxisAngle): ReferenceSpace;
    public rotate(r: any): ReferenceSpace {
        let quat: Quaternion;
        
        if (r instanceof AxisAngle) {
            quat = Quaternion.fromAxisAngle(r);
        } else if (r instanceof Quaternion) {
            quat = r;
        } else {
            quat = Quaternion.fromEuler(r);
        }
        
        this._rotationMatrix = quat.toRotationMatrix();
        this._calculateTransformationMatrix();
        return this;
    }

    private _calculateTransformationMatrix(): void {
        this._transformationMatrix = math.multiply(this._rotationMatrix, math.multiply(this._translationMatrix, this._scaleMatrix)) as number[][];
    }

    /**
     * Transform the vector to another
     * 
     * @param vector Vector to transform
     */
    public transform(vector: number[]): number[] {
        const result = math.multiply(new Vector4().set(vector), this.transformationMatrix);
        result.pop();
        return result;
    }

    /**
     * Get the transformation matrix from this reference space to the relative space
     */
    public get transformationMatrix(): number[][] {
        return this._transformationMatrix;
    }

    public get rotationMatrix(): number[][] {
        return this._rotationMatrix;
    }

}
