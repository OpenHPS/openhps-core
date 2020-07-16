import { DataObject } from "../DataObject";
import { RelativePosition } from "../../position";
import * as math from 'mathjs';
import { AngleUnit } from "../../../utils";

export class ReferenceSpace extends DataObject {
    // Raw transformation matrix
    private _transformationMatrix: number[][];
    private _scaleMatrix: number[][];
    private _translationMatrix: number[][];
    private _rotationMatrix: number[][];

    constructor(relativeSpace?: ReferenceSpace, transformationMatrix?: number[][]) {
        super();
        this.addRelativePosition(new RelativePosition(relativeSpace));
        this._transformationMatrix = transformationMatrix;
        if (this._transformationMatrix === undefined) {
            // Initialize
            this._transformationMatrix = math.zeros([4, 4]) as number[][];
            this._scaleMatrix = math.zeros([4, 4]) as number[][];
            this._translationMatrix = math.zeros([4, 4]) as number[][];
            this._rotationMatrix = math.zeros([4, 4]) as number[][];
        }
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
        this._transformationMatrix = math.add(this._rotationMatrix, math.add(this._translationMatrix, this._scaleMatrix)) as number[][];
    }

    /**
     * Get the transformation matrix from this reference space to the relative space
     */
    public get transformationMatrix(): number[][] {
        return this._transformationMatrix;
    }

}
