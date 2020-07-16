import { RelativePosition } from "./RelativePosition";
import { AngleUnit } from '../../utils';
import { SerializableObject, SerializableMember, SerializableArrayMember } from '../decorators';
import { ReferenceSpace } from "../object";
import { Absolute2DPosition } from "./Absolute2DPosition";
import * as math from 'mathjs';

/**
 * Relative cartesian 2d poisition to another reference object or space
 */
@SerializableObject()
export class Relative2DPosition extends RelativePosition {
    private _x: number = 0;
    private _y: number = 0;
    @SerializableArrayMember(Array)
    protected transformationMatrix: number[][];

    constructor(space?: ReferenceSpace, x?: number, y?: number) {
        super(space);
        this.x = x;
        this.y = y;
        this.transformationMatrix = space.transformationMatrix;
    }

    public get transform(): Absolute2DPosition {
        const absolute = new Absolute2DPosition();
        absolute.point = math.multiply([this.x, this.y, 0, 1], this.transformationMatrix);
        return absolute;
    }

    /**
     * Get X coordinate
     */
    @SerializableMember()
    public get x(): number {
        return this._x;
    }

    /**
     * Set X coordinate
     * @param x X coordinate
     */
    public set x(x: number) {
        this._x = x;
    }

    /**
     * Get Y coordinate
     */
    @SerializableMember()
    public get y(): number {
        return this._y;
    }

    /**
     * Set Y coordinate
     * @param y Y coordinate
     */
    public set y(y: number) {
        this._y = y;
    }

    /**
     * Get accuracy unit
     */
    @SerializableMember()
    public get accuracyUnit(): AngleUnit {
        return super.accuracyUnit;
    }

    public set accuracyUnit(unit: AngleUnit) {
        super.accuracyUnit = unit;
    }

}
