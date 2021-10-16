import { SerializableObject, SerializableMember } from '../decorators';
import { AngularVelocity } from './AngularVelocity';
import { LinearVelocity } from './LinearVelocity';

/**
 * Velocity of the object at the recorded position
 *
 * @category Sensor Value
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
        return new (this.constructor as new (...args:any[]) => this)(
            this.linear ? this.linear.clone() : undefined,
            this.angular ? this.angular.clone() : undefined,
        );
    }
}
