import { Unit } from "./Unit";
import { SerializableObject } from "../../data/decorators";

@SerializableObject()
export class MagnetismUnit extends Unit {

    public static readonly TESLA: MagnetismUnit = new MagnetismUnit("tesla", {
        baseName: "magnetism",
        aliases: ["T"],
        prefixes: 'decimal'
    });

}
