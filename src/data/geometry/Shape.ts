import { AbsoluteLocation } from "../location/AbsoluteLocation";

export interface Shape {
    /**
     * The center of the shape as an absolute location
     */
    center: AbsoluteLocation;
}
