import { DataFrame } from './DataFrame';
import { SerializableObject, SerializableMember } from './decorators';
import { Magnetism, Acceleration, LinearVelocity, AngularVelocity } from './position';
import { Quaternion } from '../utils';

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
    public relativeOrientation: Quaternion;
    @SerializableMember()
    public absoluteOrientation: Quaternion;
    @SerializableMember()
    public linearVelocity: LinearVelocity;
    @SerializableMember()
    public angularVelocity: AngularVelocity;
}
