import { Vector } from "./Vector";

export class Vector2D implements Vector {
    protected _x: number;
    protected _y: number;

    /**
     * Get X component of the vector
     */
    public getX(): number {
        return this._x;
    }

    /**
     * Set X component of the vector
     * @param x X component
     */
    public setX(x: number): void {
        this._x = x;
    }

    /**
     * Get Y component of the vector
     */
    public getY(): number {
        return this._y;
    }

    /**
     * Set Y component of the vector
     * @param y Y component
     */
    public setY(y: number): void {
        this._y = y;
    }

    /**
     * Add a vector to this one
     * @param vec Vector to add
     */
    public add(vec: Vector2D): Vector2D {
        this._x += vec.getX();
        this._y += vec.getY();
        return this;
    }

    /**
     * Subtract a vector from this one
     * @param vec Vector to substract
     */
    public substract(vec: Vector2D): Vector2D {
        this._x -= vec.getX();
        this._y -= vec.getY();
        return this;
    }

    /**
     * Multiply a vector with this one
     * @param vec Vector to multiply
     */
    public multiply(vec: Vector2D): Vector2D {
        this._x *= vec.getX();
        this._y *= vec.getY();
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
        return this._x * other._x + this._y * other._y;
    }

}
