import { SerializableObject, SerializableMember } from '../decorators';
import { LengthUnit, Vector3 } from '../../utils';
import { AbsolutePosition } from './AbsolutePosition';
import { Velocity } from './Velocity';
import { TimeService } from '../../service';
import { AngularVelocity } from './AngularVelocity';
import { LinearVelocity } from './LinearVelocity';
import { Orientation } from './Orientation';

/**
 * Absolute cartesian 3D position. This class extends a [[Vector3]]. This location can be used both as
 * an absolute location or relative location.
 *
 * @category Position
 */
@SerializableObject()
export class Absolute3DPosition extends Vector3 implements AbsolutePosition {
    /**
     * Position recording timestamp
     */
    @SerializableMember()
    public timestamp: number = TimeService.now();
    /**
     * Velocity at recorded position
     */
    @SerializableMember()
    public velocity: Velocity = new Velocity();
    /**
     * Orientation at recorded position
     */
    @SerializableMember({
        deserializer: function (json) {
            if (!json) {
                return undefined;
            }
            return new Orientation(json.x, json.y, json.z, json.w, json.accuracy);
        },
        serializer: function (value) {
            if (!value) {
                return undefined;
            }
            return {
                x: value.x,
                y: value.y,
                z: value.z,
                w: value.w,
                accuracy: value.accuracy,
            };
        },
    })
    public orientation: Orientation;
    /**
     * Position unit
     */
    @SerializableMember()
    public unit: LengthUnit = LengthUnit.METER;
    /**
     * Position reference space UID
     */
    @SerializableMember()
    public referenceSpaceUID: string;
    /**
     * Position accuracy
     */
    @SerializableMember()
    public accuracy: number;

    /**
     * Midpoint to another location
     *
     * @param {Absolute3DPosition} otherPosition Other location
     * @param {number} distanceSelf Distance to itself
     * @param {number} distanceOther Distance to other position
     * @returns {Absolute3DPosition} Calculated midpoint
     */
    public midpoint(otherPosition: Absolute3DPosition, distanceSelf = 1, distanceOther = 1): Absolute3DPosition {
        const newPoint = new Absolute3DPosition();
        newPoint.accuracy = this.accuracy + otherPosition.accuracy / 2;
        newPoint.set((this.x + otherPosition.x) / 2, (this.y + otherPosition.y) / 2, (this.z + otherPosition.z) / 2);
        return newPoint;
    }

    /**
     * Get the linear velocity
     *
     * @returns {LinearVelocity} Linear velocity
     */
    public get linearVelocity(): LinearVelocity {
        if (!this.velocity) {
            return undefined;
        }
        return this.velocity.linear;
    }

    /**
     * Set the linear velocity
     */
    public set linearVelocity(value: LinearVelocity) {
        if (!this.velocity) {
            this.velocity = new Velocity();
        }
        this.velocity.linear = value;
    }

    /**
     * Get the angular velocity
     *
     * @returns {AngularVelocity} Angular velocity
     */
    public get angularVelocity(): AngularVelocity {
        if (!this.velocity) {
            return undefined;
        }
        return this.velocity.angular;
    }

    /**
     * Set the angular velocity
     */
    public set angularVelocity(value: AngularVelocity) {
        if (!this.velocity) {
            this.velocity = new Velocity();
        }
        this.velocity.angular = value;
    }

    public fromVector(vector: Vector3, unit?: LengthUnit): void {
        if (unit) {
            this.x = unit.convert(vector.x, this.unit);
            this.y = unit.convert(vector.y, this.unit);
            this.z = unit.convert(vector.z, this.unit);
        } else {
            this.x = vector.x;
            this.y = vector.y;
            this.z = vector.z;
        }
    }

    public toVector3(unit?: LengthUnit): Vector3 {
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

    public equals(position: Absolute3DPosition): boolean {
        return this.toVector3(this.unit).equals(position.toVector3(this.unit));
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
