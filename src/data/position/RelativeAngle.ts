import { AngleUnit } from '../../utils';
import { SerializableObject, SerializableMember } from '../decorators';
import { Orientation } from './Orientation';
import { RelativePosition } from './RelativePosition';

/**
 * Relative location to another reference object measured in the angle.
 *
 * @category Position
 */
@SerializableObject()
export class RelativeAngle extends RelativePosition<number, AngleUnit> {
    /**
     * Orientation at recorded position
     */
    @SerializableMember()
    orientation: Orientation = new Orientation();
    /**
     * Angle unit
     */
    @SerializableMember()
    angleUnit: AngleUnit;

    constructor(referenceObject?: any, angle?: number, angleUnit?: AngleUnit, orientation?: Orientation) {
        super(referenceObject, angle);
        this.angleUnit = angleUnit;
        if (orientation) {
            this.orientation = orientation;
        }
    }

    /**
     * Angle to reference object
     *
     * @returns {number} Angle
     */
    get angle(): number {
        return this.referenceValue;
    }

    set angle(value: number) {
        this.referenceValue = value;
    }
}
