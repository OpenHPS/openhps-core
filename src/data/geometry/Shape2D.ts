import { Shape } from "./Shape";
import { SquareUnit } from "../../utils/unit/SquareUnit";

export interface Shape2D extends Shape {
    getSquareSize(): number;
}
