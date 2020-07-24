import { Unit } from "./Unit";

export class MagnetismUnit extends Unit {
    public static readonly MICRO_TESLA: MagnetismUnit = new MagnetismUnit((x) => x, (x) => x);
}
