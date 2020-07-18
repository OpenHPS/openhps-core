import { LinearVelocityUnit, AngularVelocityUnit } from "../../utils";
import { SerializableObject, SerializableArrayMember, SerializableMember } from "../decorators";
import { AngularVelocity } from "./AngularVelocity";
import { LinearVelocity } from "./LinearVelocity";

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
}
