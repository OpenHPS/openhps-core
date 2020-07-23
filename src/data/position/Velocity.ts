import { SerializableObject, SerializableMember } from "../decorators";
import { AngularVelocity } from "./AngularVelocity";
import { LinearVelocity } from "./LinearVelocity";
import * as math from 'mathjs';

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

    public toTransformationMatrix(): number[][] {
        return math.multiply(this.angular.toRotationMatrix(), this.linear.toTranslationMatrix());
    }
}
