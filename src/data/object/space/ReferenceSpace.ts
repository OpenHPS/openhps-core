import { DataObject } from "../DataObject";
import * as math from 'mathjs';
import { AngleUnit } from "../../../utils";
import { Space } from "./Space";
import { SerializableObject, SerializableArrayMember } from "../../decorators";

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

    private _baseSpace: ReferenceSpace;

    constructor(baseSpace?: ReferenceSpace, transformationMatrix?: number[][]) {
        super();
        this._baseSpace = baseSpace;
        
        this._transformationMatrix = transformationMatrix;
        if (this._transformationMatrix === undefined) {
            // Initialize
            this._transformationMatrix = [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ];
        }

        this._scaleMatrix = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
        this._translationMatrix = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
        this._rotationMatrix = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }

    public translation(dX: number, dY: number, dZ: number): ReferenceSpace {
        this._translationMatrix = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [dX, dY, dZ, 1]
        ];
        this._calculateTransformationMatrix();
        return this;
    }

    public scale(kX: number, kY: number, kZ: number): ReferenceSpace {
        this._scaleMatrix = [
            [kX, 0, 0, 0],
            [0, kY, 0, 0],
            [0, 0, kZ, 0],
            [0, 0, 0, 1]
        ];
        this._calculateTransformationMatrix();
        return this;
    }

    public shear(): ReferenceSpace {
        return this;
    }

    public rotation(rX: number, rY: number, rZ: number, angleUnit: AngleUnit = AngleUnit.RADIANS): ReferenceSpace {
        const radRx = angleUnit.convert(rX, AngleUnit.RADIANS);
        const radRy = angleUnit.convert(rY, AngleUnit.RADIANS);
        const radRz = angleUnit.convert(rZ, AngleUnit.RADIANS);

        const rotMatrixZ = [
            [1, 0, 0, 0],
            [0, Math.cos(radRz), -Math.sin(radRz), 0],
            [0, Math.sin(radRz), Math.cos(radRz), 0],
            [0, 0, 0, 1]
        ];
        const rotMatrixY = [
            [Math.cos(radRy), 0, Math.sin(radRy), 0],
            [0, 1, 0, 0],
            [-Math.sin(radRy), 0, Math.cos(radRy), 0],
            [0, 0, 0, 1]
        ];
        const rotMatrixX = [
            [Math.cos(radRx), -Math.sin(radRx), 0, 0],
            [Math.sin(radRx), Math.cos(radRx), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
        this._rotationMatrix = math.multiply(math.multiply(rotMatrixX, rotMatrixY), rotMatrixZ);

        this._calculateTransformationMatrix();
        return this;
    }

    private _calculateTransformationMatrix(): void {
        this._transformationMatrix = math.multiply(this._rotationMatrix, math.multiply(this._translationMatrix, this._scaleMatrix)) as number[][];
    }

    /**
     * Get the transformation matrix from this reference space to the relative space
     */
    public get transformationMatrix(): number[][] {
        return this._transformationMatrix;
    }

}
