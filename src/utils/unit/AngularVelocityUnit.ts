import { SerializableObject } from "../../data/decorators";
import { Unit } from "./Unit";

@SerializableObject()
export class AngularVelocityUnit extends Unit {

    public static readonly RADIAN_PER_SECOND = new Unit("radian per second", {
        baseName: "angularvelocity",
        aliases: ["rad/s", "radians per second"]
    });
    public static readonly DEGREE_PER_SECOND = new Unit("degree per second", {
        baseName: "angularvelocity",
        aliases: ["deg/s", "degrees per second"],
        definitions: [
            { magnitude: Math.PI / 180., unit: "rad/s" }
        ]
    });

}
