import { Cartesian2DLocation } from "./Cartesian2DLocation";

export class Cartesian3DLocation extends Cartesian2DLocation {
    private _z: number;

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
}
