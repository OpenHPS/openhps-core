import { Position } from './Position';
import { LengthUnit, Vector3 } from '../../utils';
import { Velocity } from './Velocity';
import { LinearVelocity } from './LinearVelocity';
import { AngularVelocity } from './AngularVelocity';
import { Orientation } from './Orientation';
import { SerializableMember, SerializableObject } from '../decorators';
import { TimeService } from '../../service/TimeService';

/**
 * An absolute position of a [[DataObject]].
 *
 * @category Position
 */
@SerializableObject()
export abstract class AbsolutePosition implements Position {
    /**
     * Position recording timestamp
     */
    @SerializableMember({
        index: true,
    })
    timestamp: number = TimeService.now();
    /**
     * Velocity at recorded position
     *
     * @deprecated use linearVelocity and angularVelocity instead
     */
    @SerializableMember()
    velocity: Velocity = new Velocity();
    /**
     * Orientation at recorded position
     */
    @SerializableMember({
        deserializer: Orientation.deserializer,
        serializer: Orientation.serializer,
    })
    orientation: Orientation;
    /**
     * Position unit
     */
    @SerializableMember()
    unit: LengthUnit = LengthUnit.METER;
    /**
     * Position reference space UID
     */
    @SerializableMember({
        index: true,
    })
    referenceSpaceUID: string;
    /**
     * Position accuracy
     */
    @SerializableMember()
    accuracy: number;

    /**
     * Get the linear velocity
     *
     * @returns {LinearVelocity} Linear velocity
     */
    get linearVelocity(): LinearVelocity {
        if (!this.velocity) {
            return undefined;
        }
        return this.velocity.linear;
    }

    /**
     * Set the linear velocity
     */
    set linearVelocity(value: LinearVelocity) {
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
    get angularVelocity(): AngularVelocity {
        if (!this.velocity) {
            return undefined;
        }
        return this.velocity.angular;
    }

    /**
     * Set the angular velocity
     */
    set angularVelocity(value: AngularVelocity) {
        if (!this.velocity) {
            this.velocity = new Velocity();
        }
        this.velocity.angular = value;
    }

    abstract fromVector(vector: Vector3, unit?: LengthUnit): this;

    abstract toVector3(unit?: LengthUnit): Vector3;

    /**
     * Get the angle in radians from this position to a destination
     *
     * @param {AbsolutePosition} destination Destination position
     * @returns {number} Bearing in radians from this position to destination
     */
    abstract angleTo(destination: this): number;

    /**
     * Get the distance from this location to a destination
     *
     * @param {AbsolutePosition} destination Destination location
     * @returns {number} Distance between this point and destination
     */
    abstract distanceTo(destination: this): number;

    equals(position: this): boolean {
        return this.toVector3(this.unit).equals(position.toVector3(this.unit));
    }

    /**
     * Clone the position
     *
     * @returns {AbsolutePosition} Cloned position
     */
    abstract clone(): this;
}
