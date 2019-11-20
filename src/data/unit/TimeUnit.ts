import { Unit } from "./Unit";

export class TimeUnit extends Unit {
    public static NANO = new TimeUnit((x) => x, (x) => x);
    public static MICRO = new TimeUnit((x) => x * 1000, (x) => x / 1000.);
    public static SECOND = new TimeUnit((x) => x * 1000000, (x) => x / 1000000.);
}
