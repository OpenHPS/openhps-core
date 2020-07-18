import { Unit } from "./Unit";

export class AccelerationUnit extends Unit {
    public static readonly METERS_PER_SECOND_SQUARED: AccelerationUnit = new AccelerationUnit((x) => x, (x) => x);
}
