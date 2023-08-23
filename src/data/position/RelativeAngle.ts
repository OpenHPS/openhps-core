import { AngleUnit } from '../../utils';
import { SerializableObject, SerializableMember, NumberType } from '../decorators';
import { Orientation } from './Orientation';
import { RelativePosition } from './RelativePosition';

/**
 * Relative location to another reference object measured in the angle.
 * @category Position
 */
@SerializableObject()
export class RelativeAngle extends RelativePosition<number, AngleUnit> {
    /**
     * Orientation at recorded position
     */
    @SerializableMember()
    orientation: Orientation = new Orientation();
    @SerializableMember()
    unit: AngleUnit;
    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    referenceValue: number;

    constructor(referenceObject?: any, angle?: number, angleUnit?: AngleUnit, orientation?: Orientation) {
        super(referenceObject, angle, angleUnit || AngleUnit.RADIAN);
        this.unit = angleUnit;
        if (orientation) {
            this.orientation = orientation;
        }
    }

    /**
     * Angle unit
     * @deprecated Use [[unit]] instead
     * @returns {AngleUnit} unit
     */
    get angleUnit(): AngleUnit {
        return this.unit;
    }

    set angleUnit(unit: AngleUnit) {
        this.unit = unit;
    }

    /**
     * Angle to reference object
     * @returns {number} Angle
     */
    get angle(): number {
        return this.referenceValue;
    }

    set angle(value: number) {
        this.referenceValue = value;
    }
}
