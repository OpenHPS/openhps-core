import { LinearVelocityUnit, AngularVelocityUnit } from "../../utils";
import { SerializableObject, SerializableArrayMember, SerializableMember } from "../decorators";

@SerializableObject({
    name: "Velocity"
})
export class Velocity {
    @SerializableArrayMember(Number)
    public linearVelocity: number[];

    @SerializableMember()
    public linearVelocityUnit: LinearVelocityUnit<any, any>;

    @SerializableArrayMember(Number)
    public angularVelocity: number[];

    @SerializableMember()
    public angularVelocityUnit: AngularVelocityUnit<any, any>;
}
