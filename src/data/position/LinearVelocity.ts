import { SerializableMember, SerializableObject } from '../decorators';
import { LinearVelocityUnit } from '../../utils';
import { Vector3 } from '../../utils/math';

@SerializableObject()
export class LinearVelocity extends Vector3 {
    @SerializableMember({
        isRequired: false,
    })
    public accuracy: number;

    constructor(x?: number, y?: number, z?: number, unit = LinearVelocityUnit.METER_PER_SECOND) {
        super(
            unit.convert(x ? x : 0, LinearVelocityUnit.METER_PER_SECOND),
            unit.convert(y ? y : 0, LinearVelocityUnit.METER_PER_SECOND),
            unit.convert(z ? z : 0, LinearVelocityUnit.METER_PER_SECOND),
        );
    }

    public static fromArray(
        array: number[],
        unit: LinearVelocityUnit = LinearVelocityUnit.METER_PER_SECOND,
    ): LinearVelocity {
        return new LinearVelocity(array[0], array[1], array[2], unit);
    }

    public clone(): this {
        const vector: this = super.clone();
        vector.accuracy = this.accuracy;
        return vector;
    }
}
