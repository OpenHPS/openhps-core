import { SerializableObject, SerializableMember } from "../decorators";
import { DataObject } from "./DataObject";
import { SensorObject } from "./SensorObject";
import { AngleUnit } from "../../utils";

/**
 * Camera source object
 */
@SerializableObject({
    name: "CameraObject"
})
export class CameraObject extends DataObject implements SensorObject {
    @SerializableMember()
    public horizontalFOV: number;
    @SerializableMember()
    public verticalFOV: number;
    @SerializableMember()
    public fovUnit: AngleUnit;
    @SerializableMember()
    public projectionMatrix: Float32Array;
}
