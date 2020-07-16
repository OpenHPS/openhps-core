import { RelativePosition } from "./RelativePosition";
import { LengthUnit, Unit } from "../../utils";
import { SerializableObject, SerializableMember } from '../decorators';

/**
 * Relative location to another reference object in distance.
 */
@SerializableObject()
export class RelativeDistancePosition extends RelativePosition {
    private _distance: number;
    private _distanceUnit: LengthUnit;

    constructor(referenceObject?: any, distance?: number, distanceUnit?: LengthUnit) {
        super(referenceObject);
        this.distance = distance;
        this._distanceUnit = distanceUnit;
    }

    /**
     * Get accuracy unit
     */
    @SerializableMember()
    public get accuracyUnit(): LengthUnit {
        return super.accuracyUnit;
    }

    public set accuracyUnit(unit: LengthUnit) {
        super.accuracyUnit = unit;
    }

    /**
     * Get distance to reference object
     */
    @SerializableMember()
    public get distance(): number {
        return this._distance;
    }

    /**
     * Set distance to reference object
     * @param distance Distance to reference object
     */
    public set distance(distance: number) {
        this._distance = distance;
    }

    /**
     * Get distance unit
     */
    @SerializableMember()
    public get distanceUnit(): LengthUnit {
        return this._distanceUnit;
    }

    public set distanceUnit(distanceUnit: LengthUnit) {
        this._distanceUnit = distanceUnit;
    }

}
