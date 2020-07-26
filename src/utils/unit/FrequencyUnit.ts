import { Unit } from "./Unit";

export class FrequencyUnit extends Unit {
    public static readonly HERTZ: FrequencyUnit = new FrequencyUnit((x) => x, (x) => x);
}
