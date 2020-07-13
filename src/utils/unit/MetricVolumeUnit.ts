import { VolumeUnit } from "./VolumeUnit";
import { SerializableObject } from "../../data/decorators";

@SerializableObject({
    name: "MetricVolumeUnit"
})
export class MetricVolumeUnit extends VolumeUnit {
    public static readonly CUBIC_MILLIMETERS: MetricVolumeUnit = new MetricVolumeUnit((x) => x, (x) => x);
    public static readonly CUBIC_CENTIMETERS: MetricVolumeUnit = new MetricVolumeUnit((x) => x * 10, (x) => x / 10);
    public static readonly CUBIC_METERS: MetricVolumeUnit = new MetricVolumeUnit((x) => x * 1000, (x) => x / 1000);
    public static readonly CUBIC_KILOMETERS: MetricVolumeUnit = new MetricVolumeUnit((x) => x * 10000000, (x) => x / 1000000); 
}
