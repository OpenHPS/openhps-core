import { Shape } from "./Shape";
import { VolumeUnit } from "../../utils/unit/VolumeUnit";

export interface Shape3D extends Shape {
    getVolume(): number;
}
