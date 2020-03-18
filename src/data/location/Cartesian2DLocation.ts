import { Point2D } from "../geometry/Point2D";
import { AbsoluteLocation } from "./AbsoluteLocation";
import { LengthUnit, Unit } from "../../utils";
import { SerializableMember, SerializableObject } from "../decorators";
import { Cartesian3DLocation } from "./Cartesian3DLocation";

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

}
