import { LengthUnit, Vector3 } from '../../utils';
import { NumberType, SerializableMember, SerializableObject } from '../decorators';
import { Relative2DPosition } from './Relative2DPosition';

/**
 * Relative 3D Position relative to another object. This indicates the translation and rotation
 * relative to another reference object.
 */
@SerializableObject()
export class Relative3DPosition extends Relative2DPosition {
    constructor(referenceObject?: any, x?: number, y?: number, z?: number, unit: LengthUnit = LengthUnit.METER) {
        super(referenceObject, x, y, unit);
        this.referenceValue.z = unit.convert(z ? z : 0, LengthUnit.METER);
    }

    @SerializableMember({
        numberType: NumberType.DECIMAL,
    })
    get z(): number {
        if (!this.referenceValue) {
            return undefined;
        }
        return this.referenceValue.z;
    }

    set z(value: number) {
        if (!this.referenceValue) {
            return;
        }
        this.referenceValue.z = value;
    }

    fromVector(vector: Vector3, unit?: LengthUnit): this {
        if (unit) {
            this.x = unit.convert(vector.x, this.unit);
            this.y = unit.convert(vector.y, this.unit);
            this.z = unit.convert(vector.z ?? 0, this.unit);
        } else {
            this.x = vector.x;
            this.y = vector.y;
            this.z = vector.z ?? 0;
        }
        return this;
    }

    toVector3(unit?: LengthUnit): Vector3 {
        if (unit) {
            return new Vector3(
                this.unit.convert(this.x, unit),
                this.unit.convert(this.y, unit),
                this.unit.convert(this.z, unit),
            );
        } else {
            return new Vector3(this.x, this.y, this.z);
        }
    }

    /**
     * Clone the position
     * @returns {Absolute3DPosition} Cloned position
     */
    clone(): this {
        const position = super.clone();
        position.x = this.x;
        position.y = this.y;
        position.z = this.z;
        return position as this;
    }
}
