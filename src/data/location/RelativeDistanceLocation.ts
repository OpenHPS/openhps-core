import 'reflect-metadata';
import { RelativeLocation } from "./RelativeLocation";
import { LengthUnit, Unit } from "../../utils";
import { SerializableObject, SerializableMember } from '../decorators';
import { DataObject } from '../object';

/**
 * Relative location to another reference object in distance.
 */
@SerializableObject()
export class RelativeDistanceLocation extends RelativeLocation {
    private _distance: number;
    private _distanceUnit: LengthUnit;

    constructor(referenceObject?: DataObject, distance?: number, distanceUnit?: LengthUnit) {
        super(referenceObject);
        this._distance = distance;
        this._distanceUnit = distanceUnit;
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
        this.referenceValue = distance;
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
