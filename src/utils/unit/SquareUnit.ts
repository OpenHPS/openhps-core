import { Unit } from "./Unit";
import { SerializableObject } from "../../data/decorators";

@SerializableObject()
export class SquareUnit extends Unit {
    public static readonly SQUARE_POINTS = new SquareUnit((x) => x, (x) => x);
}
