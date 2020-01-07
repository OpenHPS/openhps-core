import { Unit } from "./Unit";

export class SquareUnit extends Unit {
    public static SQUARE_POINTS = new SquareUnit((x) => x, (x) => x);
}
