import { SerializableObject, SerializableMember } from "../decorators";
import { LinearVelocityUnit } from "../../utils";

@SerializableObject()
export class LinearVelocity {
    @SerializableMember()
    public x: number;
    @SerializableMember()
    public y: number;
    @SerializableMember()
    public z: number;
    
    @SerializableMember()
    public unit?: LinearVelocityUnit<any, any>;
    
    constructor(x: number = 0, y: number = 0, z: number = 0, unit?: LinearVelocityUnit<any, any>) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public toVector(): number [] {
        return [this.x, this.y, this.z];
    }
}
