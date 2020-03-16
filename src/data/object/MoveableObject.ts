import { DataObject } from "./DataObject";
import { Vector } from "../geometry";

export interface MoveableObject extends DataObject {
    /**
     * Get the velocity of the moveable object.
     * This can be calculated or sourced information.
     */
    velocity: Vector;
}
