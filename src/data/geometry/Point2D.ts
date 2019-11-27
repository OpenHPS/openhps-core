export class Point2D {
    private _x: number;
    private _y: number;

    constructor();
    constructor(x?: number, y?: number) {
        this.setX(x);
        this.setY(y);
    }

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

    public getPoint(): number[] {
        return [this.getX(), this.getY()];
    }
}
