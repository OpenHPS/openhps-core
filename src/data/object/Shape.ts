import { AbsoluteLocation } from "../location";

export interface Shape {
    /**
     * Get center location of the shape
     */
    getCenter(): AbsoluteLocation;
}
