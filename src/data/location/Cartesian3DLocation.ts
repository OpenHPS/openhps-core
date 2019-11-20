import { Cartesian2DLocation } from "./Cartesian2DLocation";

export class Cartesian3DLocation extends Cartesian2DLocation {
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
