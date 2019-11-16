import { Object } from "./Object";
import { Vector3D } from "../../location/Vector3D";

/**
 * # OpenHPS: Moveable object
 */
export class MoveableObject extends Object {
    private _velocity: Vector3D;

    /**
     * Get object velocity
     */
    public getVelocity() : Vector3D {
        return this._velocity;
    }
}