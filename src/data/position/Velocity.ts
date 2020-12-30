import { SerializableObject, SerializableMember } from '../decorators';
import { AngularVelocity } from './AngularVelocity';
import { LinearVelocity } from './LinearVelocity';

/**
 * @category Position
 */
@SerializableObject()
export class Velocity {
    /**
     * Linear velocity
     */
    @SerializableMember()
    public linear: LinearVelocity;

    /**
     * Angular velocity
     */
    @SerializableMember()
    public angular: AngularVelocity;

    constructor(linear?: LinearVelocity, angular?: AngularVelocity) {
        this.linear = linear;
        this.angular = angular;
    }

    /**
     * Clone the velocity
     *
     * @returns {Velocity} Cloned velocity object
     */
    public clone(): this {
        return new Velocity(
            this.linear ? this.linear.clone() : undefined,
            this.angular ? this.angular.clone() : undefined,
        ) as this;
    }
}
