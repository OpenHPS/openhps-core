import { LengthUnit } from '../../utils';
import { SerializableObject, SerializableMember } from '../decorators';
import { RelativePosition } from './RelativePosition';

/**
 * Relative location to another reference object in distance.
 *
 * @category Position
 */
@SerializableObject()
export class RelativeDistance extends RelativePosition<number, LengthUnit> {
    /**
     * Distance unit
     */
    @SerializableMember()
    distanceUnit: LengthUnit;

    constructor(referenceObject?: any, distance?: number, distanceUnit?: LengthUnit) {
        super(referenceObject, distance, LengthUnit.METER);
        this.distanceUnit = distanceUnit;
    }

    /**
     * Distance to reference object
     *
     * @returns {number} Distance
     */
    get distance(): number {
        return this.referenceValue;
    }

    set distance(value: number) {
        this.referenceValue = value;
    }
}
