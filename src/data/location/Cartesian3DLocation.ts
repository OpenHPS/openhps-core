import { Point3D } from "../geometry/Point3D";
import { AbsoluteLocation } from "./AbsoluteLocation";
import { LengthUnit, Unit } from "../../utils";
import { SerializableObject, SerializableMember } from "../decorators";
import * as math from 'mathjs';
/**
 * Cartesian 3D location. This class extends a normal [[Point3D]]
 * but implements a [[Location]]. This location can be used both as
 * an absolute location or relative location.
 */
@SerializableObject()
export class Cartesian3DLocation extends Point3D implements AbsoluteLocation {
    private _accuracy: number;
    private _unit: LengthUnit = LengthUnit.POINTS;

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
    public midpoint(otherLocation: Cartesian3DLocation, distanceSelf: number = 1, distanceOther: number = 1): Promise<Cartesian3DLocation> {
        return new Promise<Cartesian3DLocation>((resolve, reject) => {
            const newPoint = new Cartesian3DLocation();
            newPoint.accuracy = this.accuracy + otherLocation.accuracy / 2;
            newPoint.point = [(this.x + otherLocation.x) / 2, (this.y + otherLocation.y) / 2, (this.z + otherLocation.z) / 2];
            resolve(newPoint);
        });
    }

    public static trilaterate(points: Cartesian3DLocation[], distances: number[]): Promise<Cartesian3DLocation> {
        return new Promise<Cartesian3DLocation>((resolve, reject) => {
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
    
            const point = new Cartesian3DLocation();
            point.unit = points[0].unit;
            point.point = math.add(points[0].point, math.add(math.add(math.multiply(eX, x), math.multiply(eY, y)), math.multiply(eZ, z))) as number[];
            resolve(point);
        });
    }

}
