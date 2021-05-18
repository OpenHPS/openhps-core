import { TimeService } from '../../service/TimeService';
import { Unit } from '../../utils';
import { Vector3 } from '../../utils/math/';
import { DataType, SerializableMember, SerializableObject } from '../decorators';

/**
 * 3D vector sensor value with accuracy and timestamp.
 */
@SerializableObject()
export class SensorValue extends Vector3 {
    @SerializableMember({
        isRequired: false,
        type: DataType.BIGINT,
    })
    public timestamp: number;
    @SerializableMember({
        isRequired: false,
        type: DataType.FLOAT,
    })
    public accuracy: number;

    constructor(x?: number, y?: number, z?: number, unit?: Unit, defaultUnit?: Unit) {
        if (unit && defaultUnit) {
            super(
                unit.convert(x ? x : 0, defaultUnit),
                unit.convert(y ? y : 0, defaultUnit),
                unit.convert(z ? z : 0, defaultUnit),
            );
        } else {
            super(x, y, z);
        }
        this.timestamp = TimeService.now();
    }

    public clone(): this {
        const vector = super.clone();
        vector.accuracy = this.accuracy;
        vector.timestamp = this.timestamp;
        return vector as this;
    }
}
