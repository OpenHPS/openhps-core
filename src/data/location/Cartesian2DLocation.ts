import { AbsoluteLocation } from "./AbsoluteLocation";

export class Cartesian2DLocation extends AbsoluteLocation {
    private _x: number;
    private _y: number;

    /**
     * Get X coordinate
     */
    public getX(): number {
        return this._x;
    }

    /**
     * Set X coordinate
     * @param x X coordinate
     */
    public setX(x: number): void {
        this._x = x;
    }

    /**
     * Get Y coordinate
     */
    public getY(): number {
        return this._y;
    }

    /**
     * Set Y coordinate
     * @param y Y coordinate
     */
    public setY(y: number): void {
        this._y = y;
    }
}
