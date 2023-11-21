import { LengthUnit } from '../../utils';
import { Vector2, Vector3 } from '../../utils/math';
import { NumberType, SerializableMember, SerializableObject } from '../decorators';
import { RelativePosition } from './RelativePosition';

/**
 * Relative 2D Position relative to another object. This indicates the translation and rotation
 * relative to another reference object.
 */
@SerializableObject()
export class Relative2DPosition extends RelativePosition<Vector3, LengthUnit> {
    constructor(referenceObject?: any, x?: number, y?: number, unit: LengthUnit = LengthUnit.METER) {
        super(referenceObject, new Vector3());
        this.referenceValue.x = unit.convert(x ? x : 0, LengthUnit.METER);
        this.referenceValue.y = unit.convert(y ? y : 0, LengthUnit.METER);
    }

    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    get x(): number {
        if (!this.referenceValue) {
            return undefined;
        }
        return this.referenceValue.x;
    }

    set x(value: number) {
        if (!this.referenceValue) {
            return;
        }
        this.referenceValue.x = value;
    }

    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    get y(): number {
        if (!this.referenceValue) {
            return undefined;
        }
        return this.referenceValue.y;
    }

    set y(value: number) {
        if (!this.referenceValue) {
            return;
        }
        this.referenceValue.y = value;
    }

    fromVector(vector: Vector2 | Vector3, unit?: LengthUnit): this {
        if (unit) {
            this.x = unit.convert(vector.x, this.unit);
            this.y = unit.convert(vector.y, this.unit);
        } else {
            this.x = vector.x;
            this.y = vector.y;
        }
        return this;
    }

    toVector3(unit?: LengthUnit): Vector3 {
        if (unit) {
            return new Vector3(this.unit.convert(this.x, unit), this.unit.convert(this.y, unit));
        } else {
            return new Vector3(this.x, this.y);
        }
    }

    /**
     * Clone the position
     * @returns {Absolute2DPosition} Cloned position
     */
    clone(): this {
        const position = super.clone();
        position.x = this.x;
        position.y = this.y;
        return position as this;
    }
}
