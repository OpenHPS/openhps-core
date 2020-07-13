import { Unit } from "./Unit";
import { SerializableObject } from "../../data/decorators";

@SerializableObject()
export class TimeUnit extends Unit {
    public static readonly NANO = new TimeUnit((x) => x, (x) => x);
    public static readonly MICRO = new TimeUnit((x) => x * 1000, (x) => x / 1000.);
    public static readonly MILLI = new TimeUnit((x) => x * 1000000, (x) => x / 1000000.);
    public static readonly SECOND = new TimeUnit((x) => x * 1000000000, (x) => x / 1000000000.);
}
