import { Relative2DPosition } from "./Relative2DPosition";
import { SerializableMember, SerializableObject } from "../decorators";
import { ReferenceSpace } from "../object";

/**
 * Relative cartesian 3d poisition to another reference object or space
 */
@SerializableObject()
export class Relative3DPosition extends Relative2DPosition {
    private _z: number = 0;

    constructor(referenceObject?: ReferenceSpace, x?: number, y?: number, z?: number) {
        super(referenceObject, x, y);
        this.z = z;
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
