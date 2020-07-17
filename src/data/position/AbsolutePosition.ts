import { Position } from "./Position";
import { SerializableObject } from "../decorators";

/**
 * Absolute position
 */
@SerializableObject()
export abstract class AbsolutePosition extends Position {
    public abstract point: number[];
}
