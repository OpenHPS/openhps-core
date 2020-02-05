import { Unit } from "../Unit";
import { SerializableObject } from "../../../data/decorators";

@SerializableObject()
export class AbstractUnit extends Unit {
    public static UNKNOWN = new AbstractUnit((x) => x, (x) => x);
} 
