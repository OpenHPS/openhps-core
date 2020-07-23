import { SerializableObject, SerializableMember } from "../decorators";
import * as math from 'mathjs';
import { Absolute2DPosition } from "./Absolute2DPosition";

/**
 * Absolute cartesian 3D position. This class extends a [[AbsolutePosition2D]]. This location can be used both as
 * an absolute location or relative location.
 */
@SerializableObject()
export class Absolute3DPosition extends Absolute2DPosition {
    private _z: number = 0;

    constructor(x?: number, y?: number, z?: number) {
        super(x, y);
        this.z = z;
    }

    /**
     * Get Z coordinate
     */
    @SerializableMember()
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

    /**
     * Midpoint to another location
     * @param otherPosition Other location
     */
    public midpoint(otherPosition: Absolute3DPosition, distanceSelf: number = 1, distanceOther: number = 1): Promise<Absolute3DPosition> {
        return new Promise<Absolute3DPosition>((resolve, reject) => {
            const newPoint = new Absolute3DPosition();
            newPoint.accuracy = this.accuracy + otherPosition.accuracy / 2;
            newPoint.x = (this.x + otherPosition.x) / 2;
            newPoint.y = (this.y + otherPosition.y) / 2;
            newPoint.z = (this.z + otherPosition.z) / 2;
            resolve(newPoint);
        });
    }

    public static trilaterate(points: Absolute3DPosition[], distances: number[]): Promise<Absolute3DPosition> {
        return new Promise<Absolute3DPosition>((resolve, reject) => {
            switch (points.length) {
                case 0:
                    resolve(null);
                    break;
                case 1:
                    resolve(points[0]);
                    break;
                case 2:
                    resolve(points[0].midpoint(points[1], distances[0], distances[1]));
                    break;
                case 3:
                default:
                    const eX = math.divide(math.subtract(points[1].point, points[0].point), math.norm(math.subtract(points[1].point, points[0].point) as number[]));
                    const i = math.multiply(eX, math.subtract(points[2].point, points[0].point)) as number;
                    const eY = math.divide((math.subtract(math.subtract(points[2].point, points[0].point), math.multiply(i, eX))), math.norm(math.subtract(math.subtract(points[2].point, points[0].point) as number[], math.multiply(i, eX) as number[]) as number[]));
                    const j = math.multiply(eY, math.subtract(points[2].point, points[0].point)) as number;
                    const eZ = math.multiply(eX, eY) as number;
                    const d = math.norm(math.subtract(points[1].point, points[0].point) as number[]) as number;
                
                    // Calculate coordinates
                    let AX = distances[0];
                    let BX = distances[1];
                    let CX = distances[2];
                    
                    let incr = -1;
                    let x = 0;
                    let y = 0;
                    // TODO: Itteration guard
                    do {
                        x = (Math.pow(AX, 2) - Math.pow(BX, 2) + Math.pow(d, 2)) / (2 * d);
                        y = ((Math.pow(AX, 2) - Math.pow(CX, 2) + Math.pow(i, 2) + Math.pow(j, 2)) / (2 * j)) - ((i / j) * x);
                        incr = Math.pow(AX, 2) - Math.pow(x, 2) - Math.pow(y, 2);
                        // Increase distances
                        AX += 0.10;
                        BX += 0.10;
                        CX += 0.10;
                    } while (incr < 0);
                    const z = Math.sqrt(incr);
            
                    const point = new Absolute3DPosition();
                    point.unit = points[0].unit;
                    point.point = math.add(points[0].point, math.add(math.add(math.multiply(eX, x), math.multiply(eY, y)), math.multiply(eZ, z))) as number[];
                    resolve(point);
                    break;
            }
        });
    }

    public distance(other: Absolute3DPosition): number {
        return Math.pow(Math.pow((other.x - this.x), 2) + Math.pow((other.y - this.y), 2) + Math.pow((other.z - this.z), 2), 1 / 2.);
    }

    public get point(): number[] {
        return [this.x, this.y, this.z];
    }

    public set point(point: number[]) {
        this.x = point[0];
        this.y = point[1];
        this.z = point[2];
    }

}
