import { LengthUnit } from "./LengthUnit";
import { SerializableObject } from "../../data/decorators";

@SerializableObject({
    name: "MetricLengthUnit"
})
export class MetricLengthUnit extends LengthUnit {
    public static readonly MILLIMETER: MetricLengthUnit = new MetricLengthUnit((x) => x, (x) => x);
    public static readonly CENTIMETER: MetricLengthUnit = new MetricLengthUnit((x) => x * 10, (x) => x / 10);
    public static readonly METER: MetricLengthUnit = new MetricLengthUnit((x) => x * 1000, (x) => x / 1000);
    public static readonly KILOMETER: MetricLengthUnit = new MetricLengthUnit((x) => x * 10000000, (x) => x / 1000000); 
}
