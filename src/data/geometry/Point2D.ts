import { SerializableObject, SerializableMember } from "../decorators";

@SerializableObject()
export class Point2D {
    @SerializableMember()
    private _x: number;
    @SerializableMember()
    private _y: number;

    constructor(x?: number, y?: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Get X coordinate
     */
    public get x(): number {
        return this._x;
    }

    /**
     * Set X coordinate
     * @param x X coordinate
     */
    public set x(x: number) {
        this._x = x;
    }

    /**
     * Get Y coordinate
     */
    public get y(): number {
        return this._y;
    }

    /**
     * Set Y coordinate
     * @param y Y coordinate
     */
    public set y(y: number) {
        this._y = y;
    }

    public get point(): number[] {
        return [this.x, this.y];
    }

    public set point(point: number[]) {
        this.x = point[0];
        this.y = point[1];
    }
}
