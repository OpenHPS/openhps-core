import { Unit } from "./Unit";
import { SerializableObject } from "../../data";

export class LengthUnit extends Unit {
    public static POINTS = new LengthUnit((x) => x, (x) => x);
}
