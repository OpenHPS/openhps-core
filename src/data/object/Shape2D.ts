import { Shape } from "./Shape";
import { LengthUnit } from "../unit/LengthUnit";

export class Shape2D implements Shape {
    private _x: number;
    private _xUnit: LengthUnit;
    private _y: number;
    private _yUnit: LengthUnit;
}