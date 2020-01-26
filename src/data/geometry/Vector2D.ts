import { Vector } from "./Vector";
import { SerializableObject, SerializableMember } from "../decorators";

@SerializableObject()
export class Vector2D implements Vector {
    @SerializableMember()
    private _x: number;
    @SerializableMember()
    private _y: number;

    constructor(x?: number, y?: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Get X component of the vector
     */
    public get x(): number {
        return this._x;
    }

    /**
     * Set X component of the vector
     * @param x X component
     */
    public set x(x: number) {
        this._x = x;
    }

    /**
     * Get Y component of the vector
     */
    public get y(): number {
        return this._y;
    }

    /**
     * Set Y component of the vector
     * @param y Y component
     */
    public set y(y: number) {
        this._y = y;
    }

    /**
     * Add a vector to this one
     * @param vec Vector to add
     */
    public add(vec: Vector2D): Vector2D {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }

    /**
     * Subtract a vector from this one
     * @param vec Vector to substract
     */
    public substract(vec: Vector2D): Vector2D {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    }

    /**
     * Multiply a vector with this one
     * @param vec Vector to multiply
     */
    public multiply(vec: Vector2D): Vector2D {
        this.x *= vec.x;
        this.y *= vec.y;
        return this;
    }

    /**
     * Calculates the dot product of this vector with another. The dot product
     * is defined as x1 * x2 + y1 * y2 + z1 * z2. The returned value is a scalar.
     *
     * @param other The other vector
     * @return dot product
     */
    public dot(other: Vector2D): number {
        return this.x * other.x + this.y * other.y;
    }

}
