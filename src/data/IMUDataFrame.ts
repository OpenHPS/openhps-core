import { DataFrame } from './DataFrame';
import { SerializableObject, SerializableMember } from './decorators';
import { Magnetism, Acceleration, LinearVelocity, AngularVelocity, Orientation } from './position';

@SerializableObject()
export class IMUDataFrame extends DataFrame {
    @SerializableMember()
    public frequency: number;
    @SerializableMember()
    public magnetism: Magnetism;
    @SerializableMember()
    public acceleration: Acceleration;
    @SerializableMember()
    public linearAcceleration: Acceleration;
    @SerializableMember()
    public gravity: Acceleration;
    @SerializableMember()
    public relativeOrientation: Orientation;
    @SerializableMember()
    public absoluteOrientation: Orientation;
    @SerializableMember()
    public linearVelocity: LinearVelocity;
    @SerializableMember()
    public angularVelocity: AngularVelocity;
}
