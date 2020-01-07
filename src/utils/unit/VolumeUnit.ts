import { Unit } from "./Unit";

export class VolumeUnit extends Unit {
    public static CUBIC_POINTS = new VolumeUnit((x) => x, (x) => x);
}
