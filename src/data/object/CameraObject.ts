import { SensorObject, SerializableObject, AngleUnit, DataObject, SerializableArrayMember, SerializableMember } from "@openhps/core";

/**
 * Camera source object
 */
@SerializableObject()
export class CameraObject extends DataObject implements SensorObject {
    @SerializableMember()
    public horizontalFOV: number;
    @SerializableMember()
    public verticalFOV: number;
    @SerializableMember()
    public fovUnit: AngleUnit;
}
