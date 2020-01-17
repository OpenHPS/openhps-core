import { Vector2D } from "../geometry/Vector2D";
import { DataObject } from "./DataObject";

export interface MoveableObject extends DataObject {
    /**
     * Get the velocity of the moveable object.
     * This can be calculated or sourced information.
     */
    velocity: Vector2D;
}
