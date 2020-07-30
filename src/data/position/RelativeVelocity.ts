import { RelativePosition } from "./RelativePosition";
import { SerializableObject } from '../decorators';
import { Velocity } from "./Velocity";

/**
 * Relative velocity to another reference object
 */
@SerializableObject()
export class RelativeVelocity extends RelativePosition {
    private _velocity: Velocity;

    constructor(referenceObject?: any, velocity?: Velocity) {
        super(referenceObject);
        this.velocity = velocity;
    }

    public get velocity(): Velocity {
        return this._velocity;
    }

    public set velocity(value: Velocity) {
        this._velocity = value;
    }

}
