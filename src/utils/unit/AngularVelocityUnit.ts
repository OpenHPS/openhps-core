import { SerializableObject } from "../../data/decorators";
import { DerivedUnit } from "./DerivedUnit";
import { AngleUnit } from "./AngleUnit";
import { TimeUnit } from "./TimeUnit";

@SerializableObject()
export class AngularVelocityUnit extends DerivedUnit {

    public static readonly RADIAN_PER_SECOND = new AngularVelocityUnit("radian per second", {
        baseName: "angularvelocity",
        aliases: ["rad/s", "radians per second"]
    }).addUnit(AngleUnit.RADIAN, 1).addUnit(TimeUnit.SECOND, -1);
    public static readonly DEGREE_PER_SECOND = AngularVelocityUnit.RADIAN_PER_SECOND
        .swap([AngleUnit.DEGREE], {
            baseName: "angularvelocity",
            name: "degree per second",
            aliases: ["deg/s", "degrees per second"],
        });
    public static readonly RADIAN_PER_MINUTE = AngularVelocityUnit.RADIAN_PER_SECOND
        .swap([TimeUnit.MINUTE], {
            baseName: "angularvelocity",
            name: "radian per minute",
            aliases: ["rad/min", "radian per minute"],
        });
    public static readonly DEGREE_PER_MINUTE = AngularVelocityUnit.RADIAN_PER_SECOND
        .swap([AngleUnit.DEGREE, TimeUnit.MINUTE], {
            baseName: "angularvelocity",
            name: "degree per minute",
            aliases: ["deg/min", "degrees per minute"],
        });

}
