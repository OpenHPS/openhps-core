import { Unit } from "../Unit";
import { SerializableObject } from "../../../data";

export class AbstractUnit extends Unit {
    public static UNKNOWN = new AbstractUnit((x) => x, (x) => x);
} 
