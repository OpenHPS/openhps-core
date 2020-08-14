import { UnitDefinition } from "./UnitDefinition";
import { UnitPrefixType } from "./UnitPrefix";

export interface UnitOptions {
    baseName: string;
    name?: string;
    definitions?: UnitDefinition[];
    aliases?: string[];
    prefixes?: UnitPrefixType;
    override?: boolean;
}
