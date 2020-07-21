import { AngularVelocityUnit } from "../../utils/unit/AngularVelocityUnit";
import { SerializableObject, SerializableMember } from "../decorators";

@SerializableObject()
export class AngularVelocity {
    @SerializableMember()
    public x: number;
    @SerializableMember()
    public y: number;
    @SerializableMember()
    public z: number;
    
    @SerializableMember()
    public unit?: AngularVelocityUnit<any, any>;
    
    constructor(x: number = 0, y: number = 0, z: number = 0, unit?: AngularVelocityUnit<any, any>) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public toVector(): number [] {
        return [this.x, this.y, this.z];
    }
}
