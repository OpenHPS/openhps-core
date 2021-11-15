import { TimeService } from '../../service/TimeService';
import { Unit } from '../../utils';
import { Vector3 } from '../../utils/math';
import { SerializableMember, SerializableObject } from '../decorators';
import { Accuracy } from './Accuracy';
import { Accuracy1D } from './Accuracy1D';

/**
 * 3D vector sensor value with accuracy and timestamp.
 */
@SerializableObject()
export class SensorValue<U extends Unit = Unit> extends Vector3 {
    @SerializableMember({
        isRequired: false,
    })
    timestamp: number;
    @SerializableMember({
        isRequired: false,
    })
    accuracy!: Accuracy<U, Vector3 | number>;
    private _defaultUnit: U;

    constructor(
        x?: number,
        y?: number,
        z?: number,
        unit?: Unit,
        defaultUnit?: U,
        accuracy?: Accuracy<U, Vector3 | number>,
    ) {
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
        this.accuracy = accuracy || new Accuracy1D(1, this._defaultUnit || (Unit.UNKNOWN as U));
    }

    /**
     * Set the accuracy of the absolute position
     *
     * @param {number | Accuracy} accuracy Accuracy object or number
     * @returns {SensorValue} instance
     */
    setAccuracy(accuracy: number | Accuracy<U, Vector3 | number>): this {
        if (typeof accuracy === 'number') {
            this.accuracy = new Accuracy1D(accuracy, this._defaultUnit);
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
