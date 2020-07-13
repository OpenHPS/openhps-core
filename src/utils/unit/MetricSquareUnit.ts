import { SquareUnit } from "./SquareUnit";
import { SerializableObject } from "../../data/decorators";

@SerializableObject({
    name: "MetricSquareUnit"
})
export class MetricSquareUnit extends SquareUnit {
    public static readonly SQUARE_MILLIMETERS: MetricSquareUnit = new MetricSquareUnit((x) => x, (x) => x);
    public static readonly SQUARE_CENTIMETERS: MetricSquareUnit = new MetricSquareUnit((x) => x * 10, (x) => x / 10);
    public static readonly SQUARE_METERS: MetricSquareUnit = new MetricSquareUnit((x) => x * 1000, (x) => x / 1000);
    public static readonly SQUARE_KILOMETERS: MetricSquareUnit = new MetricSquareUnit((x) => x * 10000000, (x) => x / 1000000); 
}
