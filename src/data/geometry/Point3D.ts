import { Point2D } from "./Point2D";
import { SerializableObject, SerializableMember } from "../decorators";
import { Vector3D } from "./Vector3D";

@SerializableObject()
export class Point3D extends Point2D {
    @SerializableMember()
    private _z: number;

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

    public applyVector(vector: Vector3D): void {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
    }

    public distance(other: Point3D): number {
        return Math.pow(Math.pow((other.x - this.x), 2) + Math.pow((other.y - this.y), 2) + Math.pow((other.z - this.z), 2), 1 / 2.);
    }
}
