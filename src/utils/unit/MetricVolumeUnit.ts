import { VolumeUnit } from "./VolumeUnit";

export class MetricVolumeUnit extends VolumeUnit {
    public static CUBIC_MILLIMETERS: MetricVolumeUnit = new MetricVolumeUnit((x) => x, (x) => x);
    public static CUBIC_CENTIMETERS: MetricVolumeUnit = new MetricVolumeUnit((x) => x * 10, (x) => x / 10);
    public static CUBIC_METERS: MetricVolumeUnit = new MetricVolumeUnit((x) => x * 1000, (x) => x / 1000);
    public static CUBIC_KILOMETERS: MetricVolumeUnit = new MetricVolumeUnit((x) => x * 10000000, (x) => x / 1000000); 
}
