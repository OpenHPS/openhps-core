import { Unit } from "./Unit";
import { SerializableObject } from "../../data/decorators";

@SerializableObject({
    name: "LengthUnit"
})
export class LengthUnit extends Unit {
    public static readonly POINTS: LengthUnit = new LengthUnit((x) => x, (x) => x);
}
