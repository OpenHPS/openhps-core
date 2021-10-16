import { LengthUnit } from '../../utils';
import { SerializableObject, SerializableMember } from '../decorators';
import { RelativePosition } from './RelativePosition';

/**
 * Relative location to another reference object in distance.
 *
 * @category Position
 */
@SerializableObject()
export class RelativeDistance extends RelativePosition<number> {
    /**
     * Distance unit
     */
    @SerializableMember()
    distanceUnit: LengthUnit;

    constructor(referenceObject?: any, distance?: number, distanceUnit?: LengthUnit) {
        super(referenceObject, distance);
        this.distanceUnit = distanceUnit;
    }

    /**
     * Distance to reference object
     *
     * @returns {number} Distance
     */
    @SerializableMember()
    public get distance(): number {
        return this.referenceValue;
    }

    public set distance(value: number) {
        this.referenceValue = value;
    }
}
