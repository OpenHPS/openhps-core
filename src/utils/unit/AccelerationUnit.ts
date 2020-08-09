import { SerializableObject } from "../../data/decorators";
import { Unit } from "./Unit";

@SerializableObject()
export class AccelerationUnit extends Unit {

    public static readonly METER_PER_SECOND_SQUARE = new Unit("meter per second squared", {
        baseName: "acceleration",
        aliases: ["m/s^2", "meters per second squared"]
    });

}
