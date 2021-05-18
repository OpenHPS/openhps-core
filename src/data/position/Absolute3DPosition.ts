import { DataType, SerializableMember, SerializableObject } from '../decorators';
import { LengthUnit, Vector3 } from '../../utils';
import { Absolute2DPosition } from './Absolute2DPosition';
/**
 * Absolute cartesian 3D position. This class uses a [[Vector3]]. This location can be used both as
 * an absolute location or relative location.
 *
 * @category Position
 */
@SerializableObject()
export class Absolute3DPosition extends Absolute2DPosition {
    constructor(x?: number, y?: number, z?: number, unit: LengthUnit = LengthUnit.METER) {
        super(x, y, unit);
        this.vector.z = unit.convert(z ? z : 0, LengthUnit.METER);
    }

    @SerializableMember({
        type: DataType.DECIMAL,
    })
    get z(): number {
        if (!this.vector) {
            return undefined;
        }
        return this.vector.z;
    }

    set z(value: number) {
        if (!this.vector) {
            return;
        }
        this.vector.z = value;
    }

    fromVector(vector: Vector3, unit?: LengthUnit): this {
        if (unit) {
            this.x = unit.convert(vector.x, this.unit);
            this.y = unit.convert(vector.y, this.unit);
            this.z = unit.convert(vector.z, this.unit);
        } else {
            this.x = vector.x;
            this.y = vector.y;
            this.z = vector.z;
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
     *
     * @returns {Absolute3DPosition} Cloned position
     */
    public clone(): this {
        const position = new Absolute3DPosition(this.x, this.y, this.z);
        position.unit = this.unit;
        position.accuracy = this.accuracy;
        position.orientation = this.orientation ? this.orientation.clone() : undefined;
        position.velocity = this.velocity ? this.velocity.clone() : undefined;
        position.timestamp = this.timestamp;
        position.referenceSpaceUID = this.referenceSpaceUID;
        return position as this;
    }
}
