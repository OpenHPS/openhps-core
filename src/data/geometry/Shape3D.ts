import { Shape } from "./Shape";
import { VolumeUnit } from "../unit/VolumeUnit";

export interface Shape3D extends Shape {
    getVolume(): number;
}
