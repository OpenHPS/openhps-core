import { Unit } from "./Unit";
import { SerializableObject } from "../../data/decorators";

@SerializableObject()
export class TimeUnit extends Unit {
    public static NANO = new TimeUnit((x) => x, (x) => x);
    public static MICRO = new TimeUnit((x) => x * 1000, (x) => x / 1000.);
    public static SECOND = new TimeUnit((x) => x * 1000000, (x) => x / 1000000.);
}
