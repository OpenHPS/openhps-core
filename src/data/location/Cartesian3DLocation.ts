import { Point3D } from "../geometry/Point3D";
import { Location } from "./Location";
import { AbsoluteLocation } from "./AbsoluteLocation";
import { LengthUnit } from "../../utils";
import { SerializableObject, SerializableMember } from "../decorators";

/**
 * Cartesian 3D location. This class extends a normal [[Point3D]]
 * but implements a [[Location]]. This location can be used both as
 * an absolute location or relative location.
 */
@SerializableObject()
export class Cartesian3DLocation extends Point3D implements AbsoluteLocation {
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
    public midpoint(otherLocation: Cartesian3DLocation, distanceSelf: number = 1, distanceOther: number = 1): Promise<Cartesian3DLocation> {
        return new Promise<Cartesian3DLocation>((resolve, reject) => {
            const newPoint = new Cartesian3DLocation();
            newPoint.accuracy = this.accuracy + otherLocation.accuracy / 2;
            newPoint.point = [(this.x + otherLocation.x) / 2, (this.y + otherLocation.y) / 2, (this.z + otherLocation.z) / 2];
            resolve(newPoint);
        });
    }
}
