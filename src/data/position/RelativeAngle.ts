import { AngleUnit } from '../../utils';
import { SerializableObject, SerializableMember } from '../decorators';
import { Orientation } from './Orientation';
import { RelativeValue } from './RelativeValue';

/**
 * Relative location to another reference object measured in the angle.
 *
 * @category Position
 */
@SerializableObject()
export class RelativeAngle extends RelativeValue {
    /**
     * Position accuracy
     */
    @SerializableMember()
    public accuracy: number;
    /**
     * Orientation at recorded position
     */
    @SerializableMember()
    public orientation: Orientation = new Orientation();
    /**
     * Angle unit
     */
    @SerializableMember()
    public angleUnit: AngleUnit;

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
    public get angle(): number {
        return this.referenceValue;
    }

    public set angle(value: number) {
        this.referenceValue = value;
    }
}
