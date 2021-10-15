import { TimeService } from '../../service/TimeService';
import { Unit } from '../../utils';
import { Vector3 } from '../../utils/math';
import { SerializableMember, SerializableObject } from '../decorators';
import { Accuracy } from './Accuracy';

/**
 * 3D vector sensor value with accuracy and timestamp.
 */
@SerializableObject()
export class SensorValue extends Vector3 {
    @SerializableMember({
        isRequired: false,
    })
    public timestamp: number;
    @SerializableMember({
        isRequired: false,
    })
    accuracy!: Accuracy;
    private _defaultUnit: Unit;

    constructor(x?: number, y?: number, z?: number, unit?: Unit, defaultUnit?: Unit, accuracy?: Accuracy) {
        if (unit && defaultUnit) {
            super(
                unit.convert(x ? x : 0, defaultUnit),
                unit.convert(y ? y : 0, defaultUnit),
                unit.convert(z ? z : 0, defaultUnit),
            );
            this._defaultUnit = defaultUnit;
        } else {
            super(x, y, z);
        }
        this.timestamp = TimeService.now();
        this.accuracy = accuracy || new Accuracy(0, Unit.UNKNOWN);
    }

    /**
     * Set the accuracy of the absolute position
     *
     * @param {number | Accuracy} accuracy Accuracy object or number
     * @returns {SensorValue} instance
     */
    setAccuracy(accuracy: number | Accuracy): this {
        if (typeof accuracy === 'number') {
            this.accuracy = new Accuracy(accuracy, this._defaultUnit);
        } else {
            this.accuracy = accuracy;
        }
        return this;
    }

    clone(): this {
        const vector = super.clone();
        vector.accuracy = this.accuracy;
        vector.timestamp = this.timestamp;
        return vector as this;
    }
}
