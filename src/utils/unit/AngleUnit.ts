import { Unit } from "./Unit";
import { SerializableObject } from "../../data/decorators";

@SerializableObject()
export class AngleUnit extends Unit {
    public static readonly DEGREES: AngleUnit = new AngleUnit((x) => x, (x) => x);
    public static readonly RADIANS: AngleUnit = new AngleUnit((x) => x * (180. / Math.PI), (x) => x * (Math.PI / 180.));
}
