import { Shape } from "./Shape";
import { SquareUnit } from "../unit/SquareUnit";

export interface Shape2D extends Shape {
    getSquareSize(): number;
}
