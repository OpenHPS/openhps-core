import { Relative2DPosition } from "./Relative2DPosition";
import { SerializableMember, SerializableObject } from "../decorators";
import { ReferenceSpace } from "../object";
import { Absolute3DPosition } from "./Absolute3DPosition";
import * as math from 'mathjs';

/**
 * Relative cartesian 3d poisition to another reference object or space
 */
@SerializableObject()
export class Relative3DPosition extends Relative2DPosition {
    private _z: number = 0;

    constructor(space?: ReferenceSpace, x?: number, y?: number, z?: number) {
        super(space, x, y);
        this.z = z;
    }

    public get transform(): Absolute3DPosition {
        const absolute = new Absolute3DPosition();
        absolute.point = math.multiply([this.x, this.y, this.z, 1], this.transformationMatrix);
        return absolute;
    }

    /**
     * Get Z coordinate
     */
    @SerializableMember()
    public get z(): number {
        return this._z;
    }

    /**
     * Set Z coordinate
     * @param z Z coordinate
     */
    public set z(z: number) {
        this._z = z;
    }

}
