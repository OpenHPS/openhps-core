import { SerializableObject, SerializableMember } from "../decorators";

/**
 * Orientation
 */
@SerializableObject()
export class Orientation {
    @SerializableMember()
    public x: number;

    @SerializableMember()
    public y: number;

    @SerializableMember()
    public z: number;
}
