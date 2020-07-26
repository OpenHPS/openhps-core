import { AbsolutePosition } from "./AbsolutePosition";
import { SerializableMember, SerializableObject } from "../decorators";
import * as math from 'mathjs';
import { LengthUnit } from "../../utils";

/**
 * Absolute cartesian 2D position. This class implements a [[Position]]. This location can be used both as
 * an absolute location or relative location.
 */
@SerializableObject()
export class Absolute2DPosition extends AbsolutePosition {
    private _x: number = 0;
    private _y: number = 0;

    constructor(x?: number, y?: number) {
        super();
        this.x = x;
        this.y = y;
    }

    /**
     * Get X coordinate
     */
    @SerializableMember()
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
    @SerializableMember()
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

    /**
     * Midpoint to another location
     * @param otherPosition Other location
     */
    public midpoint(otherPosition: Absolute2DPosition, distanceSelf: number = 1, distanceOther: number = 1): Promise<Absolute2DPosition> {
        return new Promise<Absolute2DPosition>((resolve, reject) => {
            const newPoint = new Absolute2DPosition();
            newPoint.accuracy = this.accuracy + otherPosition.accuracy / 2;
            newPoint.x = (this.x + otherPosition.x) / 2;
            newPoint.y = (this.y + otherPosition.y) / 2;
            resolve(newPoint);
        });
    }
    
    public static trilaterate(points: Absolute2DPosition[], distances: number[]): Promise<Absolute2DPosition> {
        return new Promise<Absolute2DPosition>((resolve, reject) => {
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
                    const vectors = [
                        points[0].toVector(),
                        points[1].toVector(),
                        points[2].toVector()
                    ];
                    const eX = math.divide(math.subtract(vectors[1], vectors[0]), math.norm(math.subtract(vectors[1], vectors[0]) as number[]));
                    const i = math.multiply(eX, math.subtract(vectors[2], vectors[0])) as number;
                    const eY = math.divide((math.subtract(math.subtract(vectors[2], vectors[0]), math.multiply(i, eX))), math.norm(math.subtract(math.subtract(vectors[2], vectors[0]) as number[], math.multiply(i, eX) as number[]) as number[]));
                    const j = math.multiply(eY, math.subtract(vectors[2], vectors[0])) as number;
                    const eZ = math.multiply(eX, eY) as number;
                    const d = math.norm(math.subtract(vectors[1], vectors[0]) as number[]) as number;
                
                    // Calculate coordinates
                    let AX = distances[0];
                    let BX = distances[1];
                    let CX = distances[2];
                    
                    let incr = -1;
                    let x = 0;
                    let y = 0;
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
            
                    const point = new Absolute2DPosition();
                    point.unit = points[0].unit;
                    point.fromVector(math.add(vectors[0], math.add(math.add(math.multiply(eX, x), math.multiply(eY, y)), math.multiply(eZ, z))) as number[]);
                    resolve(point);
                    break;
            }
        });
    }

    /**
     * Triangulate a cartesian 2d location
     * 
     * @source https://ieeexplore.ieee.org/document/6693716?tp=&arnumber=6693716
     * @param points 
     * @param angles 
     */
    public static triangulate(points: Absolute2DPosition[], angles: number[]): Promise<Absolute2DPosition> {
        return new Promise<Absolute2DPosition>((resolve, reject) => {
            const x1 = points[0].x - points[1].x;
            const y1 = points[0].y - points[1].y;
            const x3 = points[2].x - points[1].x;
            const y3 = points[2].y - points[1].y;
    
            const t12 = 1 / Math.tan(angles[1] - angles[0]);
            const t23 = 1 / Math.tan(angles[2] - angles[1]);
            const t31 = (1 - t12 * t23) / (t12 + t23);
            
            const x12 = x1 + t12 * y1;
            const y12 = y1 - t12 * x1;
            const x23 = x3 - t23 * y3;
            const y23 = y3 + t23 * x3;
            const x31 = (x3 + x1) + t31 * (y3 - y1);
            const y31 = (y3 + y1) - t31 * (x3 - x1);
    
            const k31 = x1 * x3 + y1 * y3 + t31 * (x1 * y3 - x3 * y1);
            const d = (x12 - x23) * (y23 - y31) - (y12 - y23) * (x23 - x31);
            if (d === 0) {
                return reject();
            }
            const xr = points[1].x + ((k31 * (y12 - y23)) / d);
            const yr = points[1].y + ((k31 * (x23 - x12)) / d);
            const point2d = new Absolute2DPosition(xr, yr);
            resolve(point2d);
        });
    }

    public distance(other: Absolute2DPosition): number {
        return Math.pow(Math.pow((other.x - this.x), 2) + Math.pow((other.y - this.y), 2), 1 / 2.);
    }

    public fromVector(vector: number[], unit?: LengthUnit): void {
        if (vector.length < 2) throw new Error(`Vector needs to be a 2D coordinate!`);
        this.x = vector[0];
        this.y = vector[1];
        if (unit !== undefined)
            this.unit = unit;
    }

    public toVector(unit?: LengthUnit): number [] {
        if (unit === undefined) {
            return [this.x, this.y];
        } else {
            return [this.unit.convert(this.x, unit), 
                this.unit.convert(this.y, unit)];
        }
    }

}
