import { Unit } from "./Unit";

export class LengthUnit extends Unit {
    public static POINTS = new LengthUnit((x) => x, (x) => x);
}
