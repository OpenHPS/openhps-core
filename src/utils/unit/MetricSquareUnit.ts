import { SquareUnit } from "./SquareUnit";

export class MetricSquareUnit extends SquareUnit {
    public static SQUARE_MILLIMETERS: MetricSquareUnit = new MetricSquareUnit((x) => x, (x) => x);
    public static SQUARE_CENTIMETERS: MetricSquareUnit = new MetricSquareUnit((x) => x * 10, (x) => x / 10);
    public static SQUARE_METERS: MetricSquareUnit = new MetricSquareUnit((x) => x * 1000, (x) => x / 1000);
    public static SQUARE_KILOMETERS: MetricSquareUnit = new MetricSquareUnit((x) => x * 10000000, (x) => x / 1000000); 
}
