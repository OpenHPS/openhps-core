import { SerializableObject } from "../../data/decorators";
import { LengthUnit } from "./LengthUnit";
import { TimeUnit } from "./TimeUnit";
import { SpeedUnit } from "./SpeedUnit";
import { MetricLengthUnit } from "./MetricLengthUnit";

@SerializableObject()
export class MetricSpeedUnit<L extends LengthUnit, T extends TimeUnit> extends SpeedUnit<L, T> {
    public static readonly METERS_PER_SECOND = new MetricSpeedUnit<MetricLengthUnit, TimeUnit>((x) => x, (x) => x);
}
