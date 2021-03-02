import { SerializableArrayMember, SerializableObject } from '../../data/decorators';

/**
 * Serializable Matrix
 */
@SerializableObject()
export class Matrix {
    @SerializableArrayMember(Number)
    public elements: number[];

    constructor(n?: number, m?: number) {
        this.elements = new Array(n * m);
    }

    /**
     * Initialize a matrix with ones
     *
     * @param {number} n Rows
     * @param {number} m Columns
     * @returns {Matrix} Matrix
     */
    public static ones(n: number, m: number): Matrix {
        return new Matrix(n, m).fill(1);
    }

    /**
     * Initialize a matrix with zeros
     *
     * @param {number} n Rows
     * @param {number} m Columns
     * @returns {Matrix} Matrix
     */
    public static zeros(n: number, m: number): Matrix {
        return new Matrix(n, m);
    }

    public fill(val: number): this {
        this.elements = this.elements.map(() => val);
        return this;
    }

    public fromArray(elements: number[]): this {
        this.elements = elements;
        return this;
    }

    public identity(): this {
        return this;
    }

    public multiplyScalar(s: number): this {
        this.elements.map((el) => el * s);
        return this;
    }

    public determinant(): number {
        return 0;
    }

    public transpose(): this {
        return this;
    }

    public invert(): this {
        return this;
    }

    public clone(): this {
        return new Matrix().fromArray(this.elements) as this;
    }
}
