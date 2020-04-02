import { Point2D } from "../geometry/Point2D";
import { AbsoluteLocation } from "./AbsoluteLocation";
import { LengthUnit, Unit } from "../../utils";
import { SerializableMember, SerializableObject } from "../decorators";
import { Cartesian3DLocation } from "./Cartesian3DLocation";
import { Vector2D } from "../geometry";

/**
 * Cartesian 2D location. This class extends a normal [[Point2D]]
 * but implements a [[Location]]. This location can be used both as
 * an absolute location or relative location.
 */
@SerializableObject()
export class Cartesian2DLocation extends Point2D implements AbsoluteLocation {
    private _accuracy: number;
    private _unit: LengthUnit = LengthUnit.POINTS;
    private _timestamp: number = new Date().getTime();
    public velocity: Vector2D = new Vector2D();

    @SerializableMember()
    public get timestamp(): number {
        return this._timestamp;
    }

    public set timestamp(timestamp: number) {
        this._timestamp = timestamp;
    }

    /**
     * Get location accuracy
     */
    @SerializableMember()
    public get accuracy(): number {
        return this._accuracy;
    }

    /**
     * Set location accuracy
     * @param accuracy Location accuracy
     */
    public set accuracy(accuracy: number) {
        this._accuracy = accuracy;
    }

    @SerializableMember()
    public get unit(): LengthUnit {
        return this._unit;
    }

    public set unit(unit: LengthUnit) {
        this._unit = unit;
    }

    public get accuracyUnit(): LengthUnit {
        return this.unit;
    }

    /**
     * Midpoint to another location
     * @param otherLocation Other location
     */
    public midpoint(otherLocation: Cartesian2DLocation, distanceSelf: number = 1, distanceOther: number = 1): Promise<Cartesian2DLocation> {
        return new Promise<Cartesian2DLocation>((resolve, reject) => {
            const newPoint = new Cartesian2DLocation();
            newPoint.accuracy = this.accuracy + otherLocation.accuracy / 2;
            newPoint.point = [(this.x + otherLocation.x) / 2, (this.y + otherLocation.y) / 2];
            resolve(newPoint);
        });
    }
    
    public static trilaterate(points: Cartesian2DLocation[], distances: number[]): Promise<Cartesian2DLocation> {
        return new Promise<Cartesian2DLocation>((resolve, reject) => {
            const convertedPoints = new Array();
            points.forEach(point => {
                const convertedPoint = new Cartesian3DLocation(point.x, point.y, 1);
                convertedPoint.accuracy = point.accuracy;
                convertedPoint.unit = point.unit;
                convertedPoints.push(convertedPoint);
            });
            Cartesian3DLocation.trilaterate(convertedPoints, distances).then(point3d => {
                const point2d = new Cartesian2DLocation(point3d.x, point3d.y);
                point2d.accuracy = point3d.accuracy;
                point2d.unit = point3d.unit;
                resolve(point2d);
            }).catch(ex => {
                reject(ex);
            });
        });
    }

    /**
     * Triangulate a cartesian 2d location
     * 
     * @source https://ieeexplore.ieee.org/document/6693716?tp=&arnumber=6693716
     * @param points 
     * @param angles 
     */
    public static triangulate(points: Cartesian2DLocation[], angles: number[]): Promise<Cartesian2DLocation> {
        return new Promise<Cartesian2DLocation>((resolve, reject) => {
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
            const point2d = new Cartesian2DLocation(xr, yr);
            resolve(point2d);
        });
    }

}
