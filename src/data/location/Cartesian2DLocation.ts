import { Point2D } from "../geometry/Point2D";
import { Location } from "./Location";

/**
 * Cartesian 2D location. This class extends a normal [[Point2D]]
 * but implements a [[Location]]. This location can be used both as
 * an absolute location or relative location.
 */
export class Cartesian2DLocation extends Point2D implements Location {

}
