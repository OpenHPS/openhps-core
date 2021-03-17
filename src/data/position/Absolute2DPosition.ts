import { AbsolutePosition } from './AbsolutePosition';
import { SerializableMember, SerializableObject } from '../decorators';
import { LengthUnit } from '../../utils';
import { Vector3, Vector2 } from '../../utils/math';
import { Velocity } from './Velocity';
import { TimeService } from '../../service/TimeService';
import { LinearVelocity } from './LinearVelocity';
import { AngularVelocity } from './AngularVelocity';
import { Orientation } from './Orientation';

/**
 * Absolute cartesian 2D position. This class implements a [[Vector2]]. This location can be used both as
 * an absolute location or relative location.
 *
 * @category Position
 */
@SerializableObject()
export class Absolute2DPosition extends Vector2 implements AbsolutePosition {
    /**
     * Position recording timestamp
     */
    @SerializableMember()
    public timestamp: number = TimeService.now();
    /**
     * Velocity at recorded position
     *
     * @deprecated use linearVelocity and angularVelocity instead
     */
    @SerializableMember()
    public velocity: Velocity = new Velocity();
    /**
     * Orientation at recorded position
     */
    @SerializableMember({
        deserializer: Orientation.deserializer,
        serializer: Orientation.serializer,
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

    /**
     * Get the angle in radians from this position to a destination
     *
     * @param {Absolute2DPosition} destination Destination position
     * @returns {number} Bearing in radians from this position to destination
     */
    public angleTo(destination: Absolute2DPosition): number {
        return this.toVector3().angleTo(destination.toVector3());
    }

    /**
     * Get the distance from this location to a destination
     *
     * @param {Absolute2DPosition} destination Destination location
     * @returns {number} Distance between this point and destination
     */
    public distanceTo(destination: Absolute2DPosition): number {
        return super.distanceTo(destination);
    }

    public fromVector(vector: Vector2 | Vector3, unit?: LengthUnit): this {
        if (unit) {
            this.x = unit.convert(vector.x, this.unit);
            this.y = unit.convert(vector.y, this.unit);
        } else {
            this.x = vector.x;
            this.y = vector.y;
        }
        return this;
    }

    public toVector3(unit?: LengthUnit): Vector3 {
        if (unit) {
            return new Vector3(this.unit.convert(this.x, unit), this.unit.convert(this.y, unit));
        } else {
            return new Vector3(this.x, this.y);
        }
    }

    public equals(position: Absolute2DPosition): boolean {
        return this.toVector3(this.unit).equals(position.toVector3(this.unit));
    }

    /**
     * Clone the position
     *
     * @returns {Absolute2DPosition} Cloned position
     */
    public clone(): this {
        const position = new Absolute2DPosition(this.x, this.y);
        position.unit = this.unit;
        position.accuracy = this.accuracy;
        position.orientation = this.orientation ? this.orientation.clone() : undefined;
        position.linearVelocity = this.linearVelocity ? this.linearVelocity.clone() : undefined;
        position.angularVelocity = this.angularVelocity ? this.angularVelocity.clone() : undefined;
        position.timestamp = this.timestamp;
        position.referenceSpaceUID = this.referenceSpaceUID;
        return position as this;
    }
}
