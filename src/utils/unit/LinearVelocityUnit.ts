import { SerializableObject } from "../../data/decorators";
import { Unit } from "./Unit";

@SerializableObject()
export class LinearVelocityUnit extends Unit {
    public static readonly METER_PER_SECOND = new LinearVelocityUnit("meter per second", {
        baseName: "linearvelocity",
        aliases: ["m/s", "meters per second"],
    });
}
