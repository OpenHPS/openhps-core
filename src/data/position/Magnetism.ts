import { SerializableObject } from "../decorators";
import { MagnetismUnit, Vector3 } from "../../utils";

@SerializableObject()
export class Magnetism extends Vector3 {

    constructor(x: number = 0, y: number = 0, z: number = 0, unit: MagnetismUnit = MagnetismUnit.MICROTESLA) {
        super(
            unit.convert(x, MagnetismUnit.MICROTESLA),
            unit.convert(y, MagnetismUnit.MICROTESLA),
            unit.convert(z, MagnetismUnit.MICROTESLA)
        );
    }

}
