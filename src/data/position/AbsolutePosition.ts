import { Position } from "./Position";
import { SerializableObject } from "../decorators";
import { LengthUnit } from "../../utils";

/**
 * Absolute position
 */
@SerializableObject()
export abstract class AbsolutePosition extends Position {

    public static fromVector<P extends AbsolutePosition>(vector: number[], unit: LengthUnit, type: new () => P): P {
        const position = new type();
        position.unit = unit;
        position.fromVector(vector);
        return position;
    }

    public abstract fromVector(vector: number[], unit?: LengthUnit): void;
    
    public abstract toVector(unit?: LengthUnit): number[];

    public equals(position: AbsolutePosition): boolean {
        const s = this.toVector();
        const o = position.toVector();
        if (s.length !== o.length) return false;

        for (let i = 0; s.length < i; i++) {
            if (s[i] !== o[i]) return false;
        }
        return true;
    }

}
