import { SerializableObject, SerializableMember } from '../decorators';
import { AngularVelocity } from './AngularVelocity';
import { LinearVelocity } from './LinearVelocity';

@SerializableObject()
export class Velocity {
    /**
     * Linear velocity
     */
    @SerializableMember()
    public linear: LinearVelocity = new LinearVelocity();

    /**
     * Angular velocity
     */
    @SerializableMember()
    public angular: AngularVelocity = new AngularVelocity();

    constructor(linear: LinearVelocity = new LinearVelocity(), angular: AngularVelocity = new AngularVelocity()) {
        this.linear = linear;
        this.angular = angular;
    }

    /**
     * Clone the velocity
     *
     * @returns {Velocity} Cloned velocity object
     */
    public clone(): this {
        return new Velocity(this.linear.clone(), this.angular.clone()) as this;
    }
}
