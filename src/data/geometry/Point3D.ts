import { Point2D } from "./Point2D";

export class Point3D extends Point2D {
    private _z: number;

    constructor();
    constructor(x?: number, y?: number, z?: number) {
        super();
        this.setX(x);
        this.setY(y);
        this.setZ(z);
    }

    /**
     * Get Z coordinate
     */
    public getZ(): number {
        return this._z;
    }

    /**
     * Set Z coordinate
     * @param z Z coordinate
     */
    public setZ(z: number): void {
        this._z = z;
    }

    public getPoint(): number[] {
        return [this.getX(), this.getY(), this.getZ()];
    }
}
