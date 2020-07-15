import { AbsolutePosition } from "./AbsolutePosition";
import { SerializableObject } from "../decorators";

@SerializableObject()
export abstract class CelestialPosition extends AbsolutePosition {
    
    /**
     * Cartesian point conversion
     */
    abstract point: number[];

}
