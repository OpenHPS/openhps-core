import { Unit } from "./Unit";
import { SerializableObject } from "../../data/decorators";

@SerializableObject()
export class VolumeUnit extends Unit {
    public static readonly CUBIC_POINTS = new VolumeUnit((x) => x, (x) => x);
}
