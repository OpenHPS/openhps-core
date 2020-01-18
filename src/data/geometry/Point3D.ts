import { Point2D } from "./Point2D";

export class Point3D extends Point2D {
    private _z: number;

    constructor();
    constructor(x?: number, y?: number, z?: number) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Get Z coordinate
     */
    public get z(): number {
        return this._z;
    }

    /**
     * Set Z coordinate
     * @param z Z coordinate
     */
    public set z(z: number) {
        this._z = z;
    }

    public get point(): number[] {
        return [this.x, this.y, this.z];
    }

    public set point(point: number[]) {
        this.x = point[0];
        this.y = point[1];
        this.z = point[2];
    }
}
