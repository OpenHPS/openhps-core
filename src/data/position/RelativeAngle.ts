import { AngleUnit, Quaternion } from '../../utils';
import { SerializableObject, SerializableMember } from '../decorators';
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
    public orientation: Quaternion = new Quaternion();
    /**
     * Angle unit
     */
    @SerializableMember()
    public angleUnit: AngleUnit;

    constructor(referenceObject?: any, angle?: number, angleUnit?: AngleUnit, orientation?: Quaternion) {
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
