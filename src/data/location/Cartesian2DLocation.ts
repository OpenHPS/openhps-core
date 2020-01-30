import { Point2D } from "../geometry/Point2D";
import { AbsoluteLocation } from "./AbsoluteLocation";
import { LengthUnit } from "../../utils";
import { SerializableMember } from "../decorators";

/**
 * Cartesian 2D location. This class extends a normal [[Point2D]]
 * but implements a [[Location]]. This location can be used both as
 * an absolute location or relative location.
 */
export class Cartesian2DLocation extends Point2D implements AbsoluteLocation {
    private _accuracy: number;

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

    /**
     * Get accuracy unit
     */
    public get accuracyUnit(): LengthUnit {
        return LengthUnit.POINTS;
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
    
}
