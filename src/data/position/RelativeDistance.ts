import { LengthUnit } from '../../utils';
import { SerializableObject, SerializableMember, NumberType } from '../decorators';
import { RelativePosition } from './RelativePosition';

/**
 * Relative location to another reference object in distance.
 * @category Position
 */
@SerializableObject()
export class RelativeDistance extends RelativePosition<number, LengthUnit> {
    /**
     * Distance unit
     */
    @SerializableMember()
    unit: LengthUnit;
    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    referenceValue: number;

    constructor(referenceObject?: any, distance?: number, distanceUnit?: LengthUnit) {
        super(referenceObject, distance, LengthUnit.METER);
        this.unit = distanceUnit;
    }

    /**
     * Distance unit
     * @deprecated Use [[unit]] instead
     * @returns {AngleUnit} unit
     */
    get distanceUnit(): LengthUnit {
        return this.unit;
    }

    set distanceUnit(unit: LengthUnit) {
        this.unit = unit;
    }

    /**
     * Distance to reference object
     * @returns {number} Distance
     */
    get distance(): number {
        return this.referenceValue;
    }

    set distance(value: number) {
        this.referenceValue = value;
    }
}
