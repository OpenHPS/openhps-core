import { LengthUnit } from "./LengthUnit";
import { SerializableObject } from "../../data/decorators";

@SerializableObject()
export class MetricLengthUnit extends LengthUnit {
    public static MILLIMETER: MetricLengthUnit = new MetricLengthUnit((x) => x, (x) => x);
    public static CENTIMETER: MetricLengthUnit = new MetricLengthUnit((x) => x * 10, (x) => x / 10);
    public static METER: MetricLengthUnit = new MetricLengthUnit((x) => x * 1000, (x) => x / 1000);
    public static KILOMETER: MetricLengthUnit = new MetricLengthUnit((x) => x * 10000000, (x) => x / 1000000); 
}
